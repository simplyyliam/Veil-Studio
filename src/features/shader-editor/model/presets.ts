import type {
  ShaderControlSection,
  ShaderControls,
  ShaderPresetDefinition,
  ShaderPresetId,
} from "./types";

const sharedDefaults: ShaderControls = {
  scale: 5,
  stretch: 5,
  warp: 3,
  detail: 5,
  softness: 5,
  speed: 2,
  motionAmount: 4,
  flow: 5,
  drift: 2,
  opacity: 10,
  grain: 2,
  glow: 4,
  blur: 1,
};

export const shaderPresets: Record<ShaderPresetId, ShaderPresetDefinition> = {
  coil: {
    id: "coil",
    label: "Coil",
    defaults: sharedDefaults,
  },
  saturn: {
    id: "saturn",
    label: "Saturn",
    defaults: {
      ...sharedDefaults,
      scale: 4,
      stretch: 4,
      warp: 2,
      detail: 7,
      softness: 3,
      speed: 1,
      motionAmount: 3,
      flow: 7,
      drift: 3,
      grain: 4,
      glow: 2,
    },
  },
};

export const shaderControlSections: ShaderControlSection[] = [
  {
    id: "form",
    title: "Form",
    controls: [
      { key: "scale", label: "Scale", min: 0, max: 10, step: 1 },
      { key: "stretch", label: "Stretch", min: 0, max: 10, step: 1 },
      { key: "warp", label: "Warp", min: 0, max: 10, step: 1 },
      { key: "detail", label: "Detail", min: 0, max: 10, step: 1 },
      { key: "softness", label: "Softness", min: 0, max: 10, step: 1 },
    ],
  },
  {
    id: "motion",
    title: "Motion",
    controls: [
      { key: "speed", label: "Speed", min: 0, max: 10, step: 1 },
      {
        key: "motionAmount",
        label: "Motion Amount",
        min: 0,
        max: 10,
        step: 1,
      },
      { key: "flow", label: "Flow", min: 0, max: 10, step: 1 },
      { key: "drift", label: "Drift", min: 0, max: 10, step: 1 },
    ],
  },
  {
    id: "material",
    title: "Material",
    controls: [
      { key: "opacity", label: "Opacity", min: 0, max: 10, step: 1 },
      { key: "grain", label: "Grain", min: 0, max: 10, step: 1 },
      { key: "glow", label: "Glow", min: 0, max: 10, step: 1 },
      { key: "blur", label: "Blur", min: 0, max: 10, step: 1 },
    ],
  },
];
