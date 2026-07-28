export const shaderControlKeys = [
  "scale",
  "stretch",
  "warp",
  "detail",
  "softness",
  "speed",
  "motionAmount",
  "flow",
  "drift",
  "opacity",
  "grain",
  "glow",
  "blur",
] as const;

export type ShaderControlKey = (typeof shaderControlKeys)[number];
export type ShaderControls = Record<ShaderControlKey, number>;
export type ShaderPresetId = "coil" | "saturn";
export type ShaderControlSectionId = "form" | "motion" | "material";

export type ShaderControlDefinition = {
  key: ShaderControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
};

export type ShaderControlSection = {
  id: ShaderControlSectionId;
  title: string;
  controls: ShaderControlDefinition[];
};

export type ShaderPresetDefinition = {
  id: ShaderPresetId;
  label: string;
  defaults: ShaderControls;
};
