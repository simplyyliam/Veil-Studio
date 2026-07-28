import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  OrthographicCamera,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  type IUniform,
} from "three";
import type { ShaderControls } from "@/features/shader-editor";
import {
  ribbonFragmentShader,
  ribbonVertexShader,
} from "./shaders";

type ShaderUniforms = Record<string, IUniform>;

function normalize(value: number) {
  return Math.min(1, Math.max(0, value / 10));
}

function createRibbonGeometry(segments = 512) {
  const geometry = new BufferGeometry();
  const positions: number[] = [];
  const tValues: number[] = [];
  const sideValues: number[] = [];
  const alongValues: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const vertexIndex = index * 2;
    const t = index / segments;

    positions.push(0, 0, 0, 0, 0, 0);
    tValues.push(t, t);
    sideValues.push(-1, 1);
    alongValues.push(0, 0);

    if (index < segments) {
      const nextVertexIndex = vertexIndex + 2;

      indices.push(
        vertexIndex,
        nextVertexIndex,
        vertexIndex + 1,
        nextVertexIndex,
        nextVertexIndex + 1,
        vertexIndex + 1,
      );
    }
  }

  const capSegments = 36;

  for (const cap of [{ t: 0, direction: -1 }, { t: 1, direction: 1 }]) {
    const centerIndex = tValues.length;

    positions.push(0, 0, 0);
    tValues.push(cap.t);
    sideValues.push(0);
    alongValues.push(0);

    for (let index = 0; index <= capSegments; index += 1) {
      const angle = -Math.PI / 2 + (index / capSegments) * Math.PI;

      positions.push(0, 0, 0);
      tValues.push(cap.t);
      sideValues.push(Math.sin(angle));
      alongValues.push(Math.cos(angle) * cap.direction);

      if (index < capSegments) {
        indices.push(centerIndex, centerIndex + index + 1, centerIndex + index + 2);
      }
    }
  }

  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3),
  );
  geometry.setAttribute(
    "aT",
    new BufferAttribute(new Float32Array(tValues), 1),
  );
  geometry.setAttribute(
    "aSide",
    new BufferAttribute(new Float32Array(sideValues), 1),
  );
  geometry.setAttribute(
    "aAlong",
    new BufferAttribute(new Float32Array(alongValues), 1),
  );
  geometry.setIndex(indices);

  return geometry;
}

export class ShaderRenderer {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly geometry = createRibbonGeometry();
  private readonly material: ShaderMaterial;
  private readonly uniforms: ShaderUniforms;
  private controls: ShaderControls;

  constructor(canvas: HTMLCanvasElement, controls: ShaderControls) {
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = "srgb";
    this.scene.background = new Color(0x050505);
    this.uniforms = this.createUniforms();
    this.material = new ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      side: DoubleSide,
      fragmentShader: ribbonFragmentShader,
      transparent: false,
      uniforms: this.uniforms,
      vertexShader: ribbonVertexShader,
    });

    const ribbon = new Mesh(this.geometry, this.material);
    ribbon.frustumCulled = false;
    this.scene.add(ribbon);
    this.controls = controls;
    this.setControls(controls);
  }

  setControls(controls: ShaderControls) {
    this.controls = controls;
    this.uniforms.uScale.value = normalize(controls.scale);
    this.uniforms.uStretch.value = normalize(controls.stretch);
    this.uniforms.uWarp.value = normalize(controls.warp);
    this.uniforms.uDetail.value = normalize(controls.detail);
    this.uniforms.uSoftness.value = normalize(controls.softness);
    this.uniforms.uRotationX.value = controls.rotationX * (Math.PI / 180);
    this.uniforms.uRotationY.value = controls.rotationY * (Math.PI / 180);
    this.uniforms.uRotationZ.value = controls.rotationZ * (Math.PI / 180);
    this.uniforms.uMotionAmount.value = normalize(controls.motionAmount);
    this.uniforms.uFlow.value = normalize(controls.flow);
    this.uniforms.uDrift.value = normalize(controls.drift);
    this.uniforms.uOpacity.value = normalize(controls.opacity);
    this.uniforms.uGrain.value = normalize(controls.grain) * 0.055;
    this.uniforms.uGlow.value = normalize(controls.glow);
    this.uniforms.uBlur.value = normalize(controls.blur);
  }

  resize(width: number, height: number, pixelRatio: number) {
    const safeWidth = Math.max(1, Math.floor(width));
    const safeHeight = Math.max(1, Math.floor(height));

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(safeWidth, safeHeight, false);
    this.uniforms.uResolution.value.set(
      safeWidth * pixelRatio,
      safeHeight * pixelRatio,
    );
  }

  render(phase: number) {
    const normalizedPhase = ((phase % 1) + 1) % 1;
    const speedCycles = Math.round(this.controls.speed / 2);

    this.uniforms.uPhase.value =
      speedCycles === 0 ? 0 : normalizedPhase * speedCycles * Math.PI * 2;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }

  private createUniforms(): ShaderUniforms {
    return {
      uBlur: { value: 0 },
      uColor: { value: new Color(0xe8e3cc) },
      uDetail: { value: 0 },
      uDrift: { value: 0 },
      uFlow: { value: 0 },
      uGlow: { value: 0 },
      uGrain: { value: 0 },
      uMotionAmount: { value: 0 },
      uOpacity: { value: 1 },
      uPhase: { value: 0 },
      uResolution: { value: new Vector2(1, 1) },
      uRotationX: { value: 0 },
      uRotationY: { value: 0 },
      uRotationZ: { value: 0 },
      uScale: { value: 0 },
      uSoftness: { value: 0 },
      uStretch: { value: 0 },
      uWarp: { value: 0 },
    };
  }
}
