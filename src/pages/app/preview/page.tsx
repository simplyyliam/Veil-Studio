import { AppEditorPanel } from "@/widgets";
import { PreviewCanvas } from "@/features/preview";


export default function Preview() {
  return (
    <div className="relative h-full min-h-0 overflow-hidden p-3">
      <AppEditorPanel />
      <PreviewCanvas />
    </div>
  )
}
