import { useEffect, useRef } from "react";
import { useShaderEditorStore } from "@/features/shader-editor";
import { ShaderRenderer } from "../renderer/ShaderRenderer";

const loopDurationSeconds = 12;

export function PreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const initialState = useShaderEditorStore.getState();
    const renderer = new ShaderRenderer(canvas, initialState.controls);
    const resizeObserver = new ResizeObserver(([entry]) => {
      const { height, width } = entry.contentRect;
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5);

      renderer.resize(width, height, pixelRatio);
    });
    const unsubscribe = useShaderEditorStore.subscribe((state) => {
      renderer.setControls(state.controls);
    });
    const startedAt = performance.now();
    let animationFrame = 0;

    const renderFrame = (now: number) => {
      const elapsedSeconds = (now - startedAt) / 1000;
      const phase = (elapsedSeconds % loopDurationSeconds) / loopDurationSeconds;

      renderer.render(phase);
      animationFrame = window.requestAnimationFrame(renderFrame);
    };

    resizeObserver.observe(canvas);
    animationFrame = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      unsubscribe();
      renderer.dispose();
    };
  }, []);

  return (
    <section className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl bg-background">
      <canvas
        aria-label="Live shader preview"
        className="block size-full"
        ref={canvasRef}
      />
    </section>
  );
}
