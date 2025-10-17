import { useRef, useEffect } from 'react';
import { Layer, Viewport } from '@shared/types';

export interface NavigatorProps {
  layers: Layer[];
  viewport: Viewport;
  frameWidth: number;
  frameHeight: number;
  onViewportChange: (viewport: Viewport) => void;
}

export function Navigator({
  layers,
  viewport,
  frameWidth,
  frameHeight,
}: NavigatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 180;
    const scale = Math.min(size / frameWidth, size / frameHeight);

    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, size, size);

    const scaledWidth = frameWidth * scale;
    const scaledHeight = frameHeight * scale;
    const offsetX = (size - scaledWidth) / 2;
    const offsetY = (size - scaledHeight) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(offsetX, offsetY, scaledWidth, scaledHeight);

    layers
      .filter((layer) => layer.visible && layer.type !== 'base')
      .forEach((layer) => {
        const x = offsetX + layer.transform.x * scale;
        const y = offsetY + layer.transform.y * scale;
        const w = layer.transform.width * scale;
        const h = layer.transform.height * scale;

        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.strokeRect(x, y, w, h);
      });

    const viewportWidth = (container.clientWidth / viewport.zoom) * scale;
    const viewportHeight = (container.clientHeight / viewport.zoom) * scale;
    const viewportX = offsetX + (-viewport.panX / viewport.zoom) * scale;
    const viewportY = offsetY + (-viewport.panY / viewport.zoom) * scale;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
  }, [layers, viewport, frameWidth, frameHeight]);

  return (
    <div ref={containerRef} className="p-4 border-b border-border">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-text">Navigator</h3>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full border border-border rounded bg-surface"
        style={{ maxWidth: 'var(--minimap-size)', height: 'auto', aspectRatio: '1' }}
      />
    </div>
  );
}
