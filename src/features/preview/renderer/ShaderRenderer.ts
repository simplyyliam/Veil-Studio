import {
  Color,
  Curve,
  DoubleSide,
  Group,
  Mesh,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
  type IUniform,
  type Material,
  type Object3D,
} from "three";
import type {
  ShaderControls,
  ShaderPresetId,
} from "@/features/shader-editor";
import {
  formFragmentShader,
  formVertexShader,
  ringFragmentShader,
  ringVertexShader,
} from "./shaders";

type ShaderUniforms = Record<string, IUniform>;

class HelixCurve extends Curve<Vector3> {
  private readonly turns: number;
  private readonly height: number;

  constructor(turns: number, height: number) {
    super();
    this.turns = turns;
    this.height = height;
  }

  override getPoint(t: number, target = new Vector3()) {
    const angle = t * Math.PI * 2 * this.turns;
    const radius = 1.05 + Math.sin(t * Math.PI) * 0.12;

    return target.set(
      Math.cos(angle) * radius,
      (t - 0.5) * this.height,
      Math.sin(angle) * radius,
    );
  }
}

function normalize(value: number) {
  return Math.min(1, Math.max(0, value / 10));
}

function disposeObject(object: Object3D) {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    child.geometry.dispose();

    if (Array.isArray(child.material)) {
      child.material.forEach((material: Material) => material.dispose());
    } else {
      child.material.dispose();
    }
  });
}

export class ShaderRenderer {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(38, 1, 0.1, 100);
  private readonly root = new Group();
  private activePreset: ShaderPresetId;
  private controls: ShaderControls;
  private uniforms: ShaderUniforms[] = [];
  private geometrySignature = "";

  constructor(
    canvas: HTMLCanvasElement,
    preset: ShaderPresetId,
    controls: ShaderControls,
  ) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = "srgb";
    this.scene.background = new Color(0x050505);
    this.camera.position.set(0, 0.15, 6);
    this.scene.add(this.root);
    this.activePreset = preset;
    this.controls = controls;
    this.buildPreset();
  }

  setPreset(preset: ShaderPresetId, controls: ShaderControls) {
    this.controls = controls;

    if (preset !== this.activePreset) {
      this.activePreset = preset;
      this.geometrySignature = "";
      this.buildPreset();
      return;
    }

    this.updateControls(controls);
  }

  resize(width: number, height: number, pixelRatio: number) {
    const safeWidth = Math.max(1, Math.floor(width));
    const safeHeight = Math.max(1, Math.floor(height));

    this.camera.aspect = safeWidth / safeHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(safeWidth, safeHeight, false);
  }

  render(phase: number) {
    const normalizedPhase = ((phase % 1) + 1) % 1;
    const speedCycles = Math.round(this.controls.speed / 2);
    const drift = normalize(this.controls.drift);
    const motion = normalize(this.controls.motionAmount);

    this.uniforms.forEach((uniforms) => {
      uniforms.uPhase.value = normalizedPhase * Math.max(1, speedCycles);
    });

    this.root.rotation.y = normalizedPhase * Math.PI * 2 * speedCycles;
    this.root.rotation.x =
      Math.sin(normalizedPhase * Math.PI * 2) * drift * 0.18;
    this.root.position.x =
      Math.sin(normalizedPhase * Math.PI * 2) * drift * motion * 0.25;
    this.root.position.y =
      Math.cos(normalizedPhase * Math.PI * 2) * drift * motion * 0.12;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    disposeObject(this.root);
    this.renderer.dispose();
  }

  private buildPreset() {
    disposeObject(this.root);
    this.root.clear();
    this.uniforms = [];

    if (this.activePreset === "coil") {
      this.buildCoil();
    } else {
      this.buildSaturn();
    }

    this.updateControls(this.controls);
  }

  private buildCoil() {
    const turns = 1.7 + this.controls.detail * 0.24;
    const height = 1.4 + this.controls.stretch * 0.22;
    const radius = 0.1 + this.controls.softness * 0.018;
    const curve = new HelixCurve(turns, height);
    const geometry = new TubeGeometry(curve, 220, radius, 24, false);
    const uniforms = this.createFormUniforms();
    const material = new ShaderMaterial({
      fragmentShader: formFragmentShader,
      transparent: true,
      uniforms,
      vertexShader: formVertexShader,
    });
    const mesh = new Mesh(geometry, material);

    mesh.rotation.z = -0.2;
    this.root.add(mesh);
    this.uniforms.push(uniforms);
    this.geometrySignature = this.getGeometrySignature(this.controls);
  }

  private buildSaturn() {
    const sphereUniforms = this.createFormUniforms();
    const sphereMaterial = new ShaderMaterial({
      fragmentShader: formFragmentShader,
      transparent: true,
      uniforms: sphereUniforms,
      vertexShader: formVertexShader,
    });
    const sphere = new Mesh(
      new SphereGeometry(0.82, 96, 64),
      sphereMaterial,
    );
    const ringUniforms = this.createRingUniforms();
    const ringMaterial = new ShaderMaterial({
      depthWrite: false,
      fragmentShader: ringFragmentShader,
      side: DoubleSide,
      transparent: true,
      uniforms: ringUniforms,
      vertexShader: ringVertexShader,
    });
    const rings = new Mesh(new RingGeometry(1.2, 2.38, 320, 1), ringMaterial);

    sphere.scale.y = 0.78 + normalize(this.controls.stretch) * 0.35;
    rings.rotation.x = 1.12;
    rings.rotation.y = -0.12;
    this.root.rotation.z = -0.28;
    this.root.add(sphere, rings);
    this.uniforms.push(sphereUniforms, ringUniforms);
    this.geometrySignature = this.getGeometrySignature(this.controls);
  }

  private updateControls(controls: ShaderControls) {
    const nextSignature = this.getGeometrySignature(controls);
    this.controls = controls;

    if (
      this.activePreset === "coil" &&
      this.geometrySignature !== nextSignature
    ) {
      this.buildPreset();
      return;
    }

    const scale = 0.72 + normalize(controls.scale) * 0.52;
    this.root.scale.setScalar(scale);

    this.uniforms.forEach((uniforms) => {
      uniforms.uWarp.value = normalize(controls.warp) * 0.11;
      uniforms.uMotionAmount.value = normalize(controls.motionAmount);
      uniforms.uFlow.value = controls.flow;
      uniforms.uOpacity.value = normalize(controls.opacity);
      uniforms.uGrain.value = normalize(controls.grain) * 0.12;
      uniforms.uGlow.value = normalize(controls.glow) * 0.42;
      uniforms.uBlur.value = normalize(controls.blur);

      if (uniforms.uDetail) {
        uniforms.uDetail.value = controls.detail;
      }

      if (uniforms.uSoftness) {
        uniforms.uSoftness.value = normalize(controls.softness);
      }
    });

    if (this.activePreset === "saturn") {
      const sphere = this.root.children[0];
      sphere.scale.y = 0.78 + normalize(controls.stretch) * 0.35;
    }
  }

  private createFormUniforms(): ShaderUniforms {
    return {
      uColor: { value: new Color(0xe7e1c8) },
      uBlur: { value: 0 },
      uFlow: { value: 0 },
      uGlow: { value: 0 },
      uGrain: { value: 0 },
      uMotionAmount: { value: 0 },
      uOpacity: { value: 1 },
      uPhase: { value: 0 },
      uWarp: { value: 0 },
    };
  }

  private createRingUniforms(): ShaderUniforms {
    return {
      ...this.createFormUniforms(),
      uDetail: { value: 0 },
      uSoftness: { value: 0 },
    };
  }

  private getGeometrySignature(controls: ShaderControls) {
    return `${controls.detail}:${controls.stretch}:${controls.softness}`;
  }
}
