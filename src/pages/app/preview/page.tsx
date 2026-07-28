import { AppEditorPanel } from "@/widgets";


export default function Preview() {
  return (
    <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(135deg,#111,#2d2d2a_48%,#0c0c0b)]">
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.1),transparent_18%,rgba(255,255,255,0.16)_45%,transparent_68%)] opacity-80 blur-sm" />
      <AppEditorPanel />
    </div>
  )
}
