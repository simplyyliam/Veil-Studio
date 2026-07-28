export const shaderControlKeys = [
  "scale",
  "stretch",
  "warp",
  "detail",
  "softness",
  "rotationX",
  "rotationY",
  "rotationZ",
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
export type ShaderControlSectionId =
  | "form"
  | "rotation"
  | "motion"
  | "material";

export type ShaderControlDefinition = {
  key: ShaderControlKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
};

export type ShaderControlSection = {
  id: ShaderControlSectionId;
  title: string;
  controls: ShaderControlDefinition[];
};
