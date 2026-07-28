import { Blend, Box, ChevronDown, GripHorizontal, Move3D } from "lucide-react";
import { motion, useDragControls } from "motion/react";
import { EditorPanelSlider, useSnapPanelPosition } from "@/features/editor-panel";
import {
  shaderControlSections,
  shaderPresets,
  useShaderEditorStore,
  type ShaderControlSectionId,
  type ShaderPresetId,
} from "@/features/shader-editor";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

const sectionIcons: Record<ShaderControlSectionId, typeof Box> = {
  form: Box,
  material: Blend,
  motion: Move3D,
};

export function AppEditorPanel() {
  const controls = useShaderEditorStore((state) => state.controls);
  const preset = useShaderEditorStore((state) => state.preset);
  const setControl = useShaderEditorStore((state) => state.setControl);
  const setPreset = useShaderEditorStore((state) => state.setPreset);
  const dragControls = useDragControls();
  const { panelRef, snapToBounds, x, y } = useSnapPanelPosition();
  const activePreset = shaderPresets[preset];

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
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className="h-9 w-full justify-between rounded-xl px-3"
                  variant="secondary"
                >
                  <span>{activePreset.label}</span>
                  <ChevronDown data-icon="inline-end" />
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  setPreset(value as ShaderPresetId)
                }
                value={preset}
              >
                {Object.values(shaderPresets).map((presetOption) => (
                  <DropdownMenuRadioItem
                    key={presetOption.id}
                    value={presetOption.id}
                  >
                    {presetOption.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {shaderControlSections.map(({ id, title, controls: sectionControls }) => {
            const Icon = sectionIcons[id];

            return (
            <section className="flex w-full flex-col gap-2" key={id}>
              <div className="flex min-h-8 items-center gap-1.5 text-muted-foreground">
                <Icon className="size-3.5" strokeWidth={1.8} />
                <h2 className="text-[13px] font-medium leading-none">{title}</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {sectionControls.map((control) => (
                  <EditorPanelSlider
                    key={control.key}
                    label={control.label}
                    max={control.max}
                    min={control.min}
                    onChange={(value) => setControl(control.key, value)}
                    step={control.step}
                    value={controls[control.key]}
                  />
                ))}
              </div>
            </section>
            );
          })}
        </div>
      </ScrollArea>
    </motion.aside>
  );
}
