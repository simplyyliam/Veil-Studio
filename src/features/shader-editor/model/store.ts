import { create } from "zustand";
import { shaderDefaults } from "./presets";
import type {
  ShaderControlKey,
  ShaderControls,
} from "./types";

type ShaderEditorState = {
  controls: ShaderControls;
  setControl: (key: ShaderControlKey, value: number) => void;
  reset: () => void;
};

function copyDefaults() {
  return { ...shaderDefaults };
}

export const useShaderEditorStore = create<ShaderEditorState>((set) => ({
  controls: copyDefaults(),
  setControl: (key, value) => {
    set((state) => ({
      controls: {
        ...state.controls,
        [key]: value,
      },
    }));
  },
  reset: () => {
    set({
      controls: copyDefaults(),
    });
  },
}));

export function getShaderEditorSnapshot() {
  const { controls } = useShaderEditorStore.getState();

  return {
    controls: { ...controls },
  };
}
