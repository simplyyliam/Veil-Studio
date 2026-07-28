import { useState } from "react";
import { Blend, Box, Move3D } from "lucide-react";
import { EditorPanelSlider } from "@/features/editor-panel";

type EditorControl = {
  label: string;
  defaultValue: number;
};

type EditorSection = {
  title: string;
  Icon: typeof Box;
  controls: EditorControl[];
};

const sections: EditorSection[] = [
  {
    title: "Form",
    Icon: Box,
    controls: [
      { label: "Scale", defaultValue: 5 },
      { label: "Stretch", defaultValue: 5 },
      { label: "Warp", defaultValue: 5 },
      { label: "Detail", defaultValue: 5 },
      { label: "Softness", defaultValue: 5 },
    ],
  },
  {
    title: "Motion",
    Icon: Move3D,
    controls: [
      { label: "Speed", defaultValue: 5 },
      { label: "Motion Amount", defaultValue: 5 },
      { label: "Flow", defaultValue: 5 },
      { label: "Drift", defaultValue: 5 },
    ],
  },
  {
    title: "Material",
    Icon: Blend,
    controls: [
      { label: "Opacity", defaultValue: 5 },
      { label: "Grain", defaultValue: 5 },
      { label: "Glow", defaultValue: 5 },
      { label: "Blur", defaultValue: 5 },
    ],
  },
];

const initialValues = Object.fromEntries(
  sections.flatMap((section) =>
    section.controls.map((control) => [control.label, control.defaultValue]),
  ),
) as Record<string, number>;

export function AppEditorPanel() {
  const [values, setValues] = useState(initialValues);

  function updateValue(label: string, value: number) {
    setValues((currentValues) => ({
      ...currentValues,
      [label]: value,
    }));
  }

  return (
    <aside
      aria-label="Editor controls"
      className="absolute right-0 top-0 z-20 flex h-[min(1127.44px,calc(100vh-16px))] w-[min(474px,calc(100vw-32px))] flex-col items-start gap-4 overflow-y-auto rounded-[31.7588px] bg-[#191919]/[0.71] p-[18px] text-white shadow-[0_4px_16px_rgba(59,59,59,0.5)] backdrop-blur-md"
    >
      {sections.map(({ title, Icon, controls }) => (
        <section className="w-full space-y-2" key={title}>
          <div className="flex items-center gap-2 text-white/75">
            <Icon className="size-4" strokeWidth={1.8} />
            <h2 className="text-[15px] font-medium leading-none">{title}</h2>
          </div>
          <div className="space-y-3">
            {controls.map((control) => (
              <EditorPanelSlider
                key={control.label}
                label={control.label}
                onChange={(value) => updateValue(control.label, value)}
                value={values[control.label]}
              />
            ))}
          </div>
        </section>
      ))}
    </aside>
  );
}
