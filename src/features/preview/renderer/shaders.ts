export const ribbonVertexShader = /* glsl */ `
  attribute float aT;
  attribute float aSide;
  attribute float aAlong;

  uniform vec2 uResolution;
  uniform float uPhase;
  uniform float uScale;
  uniform float uStretch;
  uniform float uWarp;
  uniform float uDetail;
  uniform float uSoftness;
  uniform float uMotionAmount;
  uniform float uFlow;
  uniform float uDrift;
  uniform float uRotationX;
  uniform float uRotationY;
  uniform float uRotationZ;

  varying float vDepth;
  varying float vT;

  const float PI = 3.14159265359;
  const float TAU = 6.28318530718;

  mat3 rotateX(float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat3(
      1.0, 0.0, 0.0,
      0.0, cosine, sine,
      0.0, -sine, cosine
    );
  }

  mat3 rotateY(float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat3(
      cosine, 0.0, -sine,
      0.0, 1.0, 0.0,
      sine, 0.0, cosine
    );
  }

  mat3 rotateZ(float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat3(
      cosine, sine, 0.0,
      -sine, cosine, 0.0,
      0.0, 0.0, 1.0
    );
  }

  vec3 ribbonCenter(float t) {
    float turns = mix(2.5, 4.5, uDetail);
    float theta = t * turns * TAU + uPhase * uMotionAmount;
    float height = mix(1.05, 1.65, uStretch);
    float wave = sin(t * TAU * (1.0 + uFlow * 2.0) + uPhase);
    float topProfile = pow(max(0.0, sin(t * PI)), 0.68);
    float radius = mix(0.12, 0.76, topProfile)
      + wave * uWarp * uMotionAmount * 0.065;
    vec3 center = vec3(
      cos(theta) * radius,
      (0.5 - t) * height,
      sin(theta) * radius
    );

    center.xz += vec2(cos(theta), sin(theta))
      * sin(uPhase + t * TAU * 2.0)
      * uMotionAmount
      * 0.018;
    return rotateZ(uRotationZ)
      * rotateX(uRotationX)
      * rotateY(uRotationY)
      * center;
  }

  void main() {
    float sampleOffset = 0.0015;
    vec3 center = ribbonCenter(aT);
    vec3 before = ribbonCenter(max(0.0, aT - sampleOffset));
    vec3 after = ribbonCenter(min(1.0, aT + sampleOffset));
    vec2 tangent = normalize(after.xy - before.xy);
    vec2 normal = vec2(-tangent.y, tangent.x);
    float taper = 0.42 + 0.58 * pow(sin(aT * PI), 0.65);
    float width = mix(0.075, 0.145, uSoftness) * taper;
    vec2 drift = vec2(sin(uPhase), cos(uPhase)) * uDrift * uMotionAmount * 0.075;
    vec2 point = center.xy + (normal * aSide + tangent * aAlong) * width + drift;
    float scale = mix(0.62, 1.04, uScale);
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    float depth = center.z;

    point.x -= 0.12;
    point *= scale;

    vDepth = clamp(depth / 0.82, -1.0, 1.0);
    vT = aT;
    gl_Position = vec4(point.x / aspect, point.y, -depth * 0.55, 1.0);
  }
`;

export const ribbonFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform float uPhase;
  uniform float uOpacity;
  uniform float uGrain;
  uniform float uGlow;
  uniform float uBlur;
  uniform float uFlow;

  varying float vDepth;
  varying float vT;

  const float PI = 3.14159265359;
  const float TAU = 6.28318530718;

  float random(vec2 point) {
    return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    float depthTone = mix(0.38, 0.96, vDepth * 0.5 + 0.5);
    float flowTone = sin(vT * TAU * (1.0 + uFlow * 2.0) - uPhase) * 0.025;
    float brightness = depthTone + flowTone + uGlow * 0.06;
    brightness = mix(brightness, 0.68, uBlur * 0.25);
    float grain = (random(gl_FragCoord.xy + uPhase * 31.0) - 0.5)
      * uGrain
      * (1.0 - uBlur * 0.7);
    float middleEnvelope = pow(max(0.0, sin(vT * PI)), 0.7);
    float endOpacity = mix(0.32, 1.0, middleEnvelope);
    float effectiveOpacity = uOpacity * endOpacity;
    vec3 color = (uColor * brightness + grain) * effectiveOpacity;

    gl_FragColor = vec4(color, 1.0);
  }
`;
