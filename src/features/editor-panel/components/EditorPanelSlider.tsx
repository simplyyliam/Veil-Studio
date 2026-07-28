import type { ChangeEvent } from "react";
import { cn } from "@/lib/utils";

type EditorPanelSliderProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
};

export function EditorPanelSlider({
  label,
  value,
  min = 0,
  max = 10,
  step = 1,
  onChange,
  className,
}: EditorPanelSliderProps) {
  const clampedValue = Math.min(max, Math.max(min, value));
  const progress = ((clampedValue - min) / (max - min)) * 100;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(Number(event.target.value));
  }

  return (
    <label
      className={cn(
        "group relative block h-9 w-full cursor-ew-resize select-none rounded-[9px] bg-white/[0.035]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        className,
      )}
    >
      <span
        className="absolute inset-y-0 left-0 rounded-[9px] bg-[#737373] transition-[width,background-color] duration-150 ease-out group-hover:bg-[#858585]"
        style={{ width: `${progress}%` }}
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
        <span className="text-[13px] font-medium leading-none text-white/55">
          {label}
        </span>
        <span className="font-mono text-[12px] leading-none text-white/50 tabular-nums">
          {clampedValue}
        </span>
      </span>
      <input
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        max={max}
        min={min}
        onChange={handleChange}
        step={step}
        type="range"
        value={clampedValue}
      />
    </label>
  );
}
