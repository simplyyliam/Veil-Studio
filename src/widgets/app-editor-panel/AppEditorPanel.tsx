import { useState } from "react";
import { Blend, Box, GripHorizontal, Move3D } from "lucide-react";
import { motion, useDragControls } from "motion/react";
import { EditorPanelSlider, useSnapPanelPosition } from "@/features/editor-panel";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const dragControls = useDragControls();
  const { panelRef, snapToBounds, x, y } = useSnapPanelPosition();

  function updateValue(label: string, value: number) {
    setValues((currentValues) => ({
      ...currentValues,
      [label]: value,
    }));
  }

  return (
    <motion.aside
      aria-label="Editor controls"
      className="fixed left-0 top-0 z-20 flex max-h-[calc(100svh-24px)] w-[calc(100vw-24px)] overflow-hidden rounded-[22px] bg-card/80 text-card-foreground backdrop-blur-md sm:max-h-[calc(100svh-32px)] sm:w-[min(340px,calc(100vw-32px))] sm:rounded-[24px]"
      drag
      dragControls={dragControls}
      dragElastic={0.08}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={(_, info) => snapToBounds(info)}
      ref={panelRef}
      style={{ x, y }}
    >
      <ScrollArea className="max-h-[inherit] w-full">
        <div className="flex flex-col gap-3 p-3.5">
          <div
            className="flex min-h-9 cursor-grab touch-none select-none items-center justify-between rounded-[12px] px-2 text-muted-foreground active:cursor-grabbing"
            onPointerDown={(event) => dragControls.start(event)}
          >
            <span className="text-[13px] font-medium leading-none">Editor</span>
            <GripHorizontal className="opacity-50 transition-opacity duration-150 ease-out hover:opacity-100" />
          </div>
          {sections.map(({ title, Icon, controls }) => (
            <section className="flex w-full flex-col gap-2" key={title}>
              <div className="flex min-h-8 items-center gap-1.5 text-muted-foreground">
                <Icon className="size-3.5" strokeWidth={1.8} />
                <h2 className="text-[13px] font-medium leading-none">{title}</h2>
              </div>
              <div className="flex flex-col gap-2.5">
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
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
