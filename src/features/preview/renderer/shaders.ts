export const formVertexShader = /* glsl */ `
  uniform float uPhase;
  uniform float uWarp;
  uniform float uMotionAmount;
  uniform float uFlow;

  varying vec3 vNormalWorld;
  varying vec3 vPositionWorld;

  void main() {
    float phase = uPhase * 6.28318530718;
    float flow = max(0.5, uFlow * 0.55);
    float wave = sin(position.y * flow + position.x * 1.7 + phase);
    float crossWave = cos(position.z * (flow + 0.8) - phase * 1.3);
    float displacement = (wave + crossWave * 0.55) * uWarp * uMotionAmount;
    vec3 displaced = position + normal * displacement;

    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
    vPositionWorld = worldPosition.xyz;
    vNormalWorld = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const formFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uGrain;
  uniform float uGlow;
  uniform float uBlur;
  uniform float uPhase;

  varying vec3 vNormalWorld;
  varying vec3 vPositionWorld;

  float random(vec2 point) {
    return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 normal = normalize(vNormalWorld);
    vec3 viewDirection = normalize(cameraPosition - vPositionWorld);
    vec3 lightDirection = normalize(vec3(-0.45, 0.8, 0.65));

    float rawLight = dot(normal, lightDirection);
    float diffuse = mix(
      max(rawLight, 0.0),
      smoothstep(-0.45, 1.0, rawLight),
      uBlur
    );
    float rim = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.4);
    float grain = (random(gl_FragCoord.xy + uPhase * 913.0) - 0.5) * uGrain * (1.0 - uBlur * 0.7);
    float lighting = 0.16 + diffuse * 0.78 + rim * (0.12 + uGlow);

    vec3 color = uColor * lighting + grain;
    gl_FragColor = vec4(color, uOpacity);
  }
`;

export const ringVertexShader = /* glsl */ `
  uniform float uPhase;
  uniform float uWarp;
  uniform float uMotionAmount;
  uniform float uFlow;

  varying float vRadius;
  varying float vAngle;

  void main() {
    float phase = uPhase * 6.28318530718;
    float radius = length(position.xy);
    float angle = atan(position.y, position.x);
    float ripple = sin(angle * (2.0 + uFlow * 0.35) + phase * 2.0);
    float radialWave = cos(radius * 12.0 - phase * 1.5);
    vec3 displaced = position;
    displaced.z += (ripple + radialWave * 0.45) * uWarp * uMotionAmount;

    vRadius = radius;
    vAngle = angle;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const ringFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uGrain;
  uniform float uGlow;
  uniform float uDetail;
  uniform float uSoftness;
  uniform float uBlur;
  uniform float uPhase;

  varying float vRadius;
  varying float vAngle;

  float random(vec2 point) {
    return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    float frequency = 24.0 + uDetail * 7.0;
    float animatedOffset = sin(vAngle * 3.0 + uPhase * 6.28318530718) * 0.8;
    float stripe = sin(vRadius * frequency + animatedOffset);
    float threshold = mix(0.76, 0.15, uSoftness);
    float band = smoothstep(threshold, threshold + mix(0.12, 0.38, uBlur), stripe);
    float edgeFade = smoothstep(1.2, 1.34, vRadius) * (1.0 - smoothstep(2.2, 2.38, vRadius));
    float grain = (random(gl_FragCoord.xy + uPhase * 419.0) - 0.5) * uGrain;
    float brightness = 0.55 + band * 0.65 + uGlow;

    gl_FragColor = vec4(uColor * brightness + grain, band * edgeFade * uOpacity);
  }
`;
