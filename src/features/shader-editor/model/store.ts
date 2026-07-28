import { create } from "zustand";
import { shaderPresets } from "./presets";
import type {
  ShaderControlKey,
  ShaderControls,
  ShaderPresetId,
} from "./types";

type ShaderEditorState = {
  preset: ShaderPresetId;
  controls: ShaderControls;
  setControl: (key: ShaderControlKey, value: number) => void;
  setPreset: (preset: ShaderPresetId) => void;
  resetPreset: () => void;
};

const initialPreset: ShaderPresetId = "coil";

function copyDefaults(preset: ShaderPresetId) {
  return { ...shaderPresets[preset].defaults };
}

export const useShaderEditorStore = create<ShaderEditorState>((set) => ({
  preset: initialPreset,
  controls: copyDefaults(initialPreset),
  setControl: (key, value) => {
    set((state) => ({
      controls: {
        ...state.controls,
        [key]: value,
      },
    }));
  },
  setPreset: (preset) => {
    set({
      preset,
      controls: copyDefaults(preset),
    });
  },
  resetPreset: () => {
    set((state) => ({
      controls: copyDefaults(state.preset),
    }));
  },
}));

export function getShaderEditorSnapshot() {
  const { controls, preset } = useShaderEditorStore.getState();

  return {
    controls: { ...controls },
    preset,
  };
}
