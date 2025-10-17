import { useRef, useEffect, useState, useCallback } from 'react';
import { Layer, Viewport, Point } from '@shared/types';
import { screenToWorld, pointInRect, transformToRect } from '../../lib/geometry';

export interface PlaygroundProps {
  layers: Layer[];
  selectedLayerId: string | null;
  viewport: Viewport;
  frameWidth: number;
  frameHeight: number;
  frameBaseColor: string;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onViewportChange: (viewport: Viewport) => void;
  onImageDrop: (file: File, position: Point) => void;
}

type InteractionMode = 'none' | 'pan' | 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se';

export function Playground({
  layers,
  selectedLayerId,
  viewport,
  frameWidth,
  frameHeight,
  frameBaseColor,
  onSelectLayer,
  onUpdateLayer,
  onViewportChange,
  onImageDrop,
}: PlaygroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('none');
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);
  const [ariaLiveMessage, setAriaLiveMessage] = useState('');

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  const announceZoom = useCallback((zoom: number) => {
    setAriaLiveMessage(`Zoom: ${Math.round(zoom * 100)}%`);
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(5, viewport.zoom * delta));

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldBefore = screenToWorld({ x: mouseX, y: mouseY }, viewport);
        const newPanX = mouseX - worldBefore.x * newZoom;
        const newPanY = mouseY - worldBefore.y * newZoom;

        onViewportChange({ zoom: newZoom, panX: newPanX, panY: newPanY });
        announceZoom(newZoom);
      } else {
        onViewportChange({
          ...viewport,
          panX: viewport.panX - e.deltaX,
          panY: viewport.panY - e.deltaY,
        });
      }
    },
    [viewport, onViewportChange, announceZoom]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenPoint: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      if (spacePressed) {
        setInteractionMode('pan');
        setDragStart(screenPoint);
        return;
      }

      const worldPoint = screenToWorld(screenPoint, viewport);

      if (selectedLayer && !selectedLayer.locked) {
        const handleSize = 8 / viewport.zoom;
        const rect = transformToRect(selectedLayer.transform);

        const handles = {
          nw: { x: rect.x, y: rect.y },
          ne: { x: rect.x + rect.width, y: rect.y },
          sw: { x: rect.x, y: rect.y + rect.height },
          se: { x: rect.x + rect.width, y: rect.y + rect.height },
        };

        for (const [key, pos] of Object.entries(handles)) {
          if (
            Math.abs(worldPoint.x - pos.x) < handleSize &&
            Math.abs(worldPoint.y - pos.y) < handleSize
          ) {
            setInteractionMode(`resize-${key}` as InteractionMode);
            setDragStart(worldPoint);
            return;
          }
        }

        if (pointInRect(worldPoint, rect)) {
          setInteractionMode('move');
          setDragStart(worldPoint);
          return;
        }
      }

      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        if (layer.visible && !layer.locked && layer.type !== 'base') {
          const rect = transformToRect(layer.transform);
          if (pointInRect(worldPoint, rect)) {
            onSelectLayer(layer.id);
            setInteractionMode('move');
            setDragStart(worldPoint);
            return;
          }
        }
      }

      onSelectLayer(null);
    },
    [layers, selectedLayer, spacePressed, viewport, onSelectLayer]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragStart || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const screenPoint: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      if (interactionMode === 'pan') {
        const dx = screenPoint.x - dragStart.x;
        const dy = screenPoint.y - dragStart.y;
        onViewportChange({
          ...viewport,
          panX: viewport.panX + dx,
          panY: viewport.panY + dy,
        });
        setDragStart(screenPoint);
      } else if (interactionMode === 'move' && selectedLayer) {
        const worldPoint = screenToWorld(screenPoint, viewport);
        const dx = worldPoint.x - dragStart.x;
        const dy = worldPoint.y - dragStart.y;

        onUpdateLayer(selectedLayer.id, {
          transform: {
            ...selectedLayer.transform,
            x: selectedLayer.transform.x + dx,
            y: selectedLayer.transform.y + dy,
          },
        });
        setDragStart(worldPoint);
      } else if (interactionMode.startsWith('resize-') && selectedLayer) {
        const worldPoint = screenToWorld(screenPoint, viewport);
        const dx = worldPoint.x - dragStart.x;
        const dy = worldPoint.y - dragStart.y;

        const transform = { ...selectedLayer.transform };

        if (interactionMode === 'resize-nw') {
          transform.x += dx;
          transform.y += dy;
          transform.width -= dx;
          transform.height -= dy;
        } else if (interactionMode === 'resize-ne') {
          transform.y += dy;
          transform.width += dx;
          transform.height -= dy;
        } else if (interactionMode === 'resize-sw') {
          transform.x += dx;
          transform.width -= dx;
          transform.height += dy;
        } else if (interactionMode === 'resize-se') {
          transform.width += dx;
          transform.height += dy;
        }

        if (transform.width > 10 && transform.height > 10) {
          onUpdateLayer(selectedLayer.id, { transform });
          setDragStart(worldPoint);
        }
      }
    },
    [
      dragStart,
      interactionMode,
      selectedLayer,
      viewport,
      onUpdateLayer,
      onViewportChange,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setInteractionMode('none');
    setDragStart(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ' ' && !spacePressed) {
        setSpacePressed(true);
        e.preventDefault();
      }

      if (!selectedLayer || selectedLayer.locked) return;

      const step = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onUpdateLayer(selectedLayer.id, {
            transform: {
              ...selectedLayer.transform,
              x: selectedLayer.transform.x - step,
            },
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          onUpdateLayer(selectedLayer.id, {
            transform: {
              ...selectedLayer.transform,
              x: selectedLayer.transform.x + step,
            },
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          onUpdateLayer(selectedLayer.id, {
            transform: {
              ...selectedLayer.transform,
              y: selectedLayer.transform.y - step,
            },
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          onUpdateLayer(selectedLayer.id, {
            transform: {
              ...selectedLayer.transform,
              y: selectedLayer.transform.y + step,
            },
          });
          break;
      }
    },
    [spacePressed, selectedLayer, onUpdateLayer]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ') {
      setSpacePressed(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((f) => f.type.startsWith('image/'));

      if (imageFile && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const screenPoint: Point = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        const worldPoint = screenToWorld(screenPoint, viewport);
        onImageDrop(imageFile, worldPoint);
      }
    },
    [viewport, onImageDrop]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleWheel, handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(viewport.panX, viewport.panY);
    ctx.scale(viewport.zoom, viewport.zoom);

    ctx.fillStyle = frameBaseColor;
    ctx.fillRect(0, 0, frameWidth, frameHeight);

    const gridSize = 50;
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-canvas-grid')
      .trim();
    ctx.lineWidth = 1 / viewport.zoom;

    for (let x = 0; x <= frameWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, frameHeight);
      ctx.stroke();
    }

    for (let y = 0; y <= frameHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(frameWidth, y);
      ctx.stroke();
    }

    layers
      .filter((l) => l.visible && l.type !== 'base')
      .forEach((layer) => {
        const { x, y, width, height } = layer.transform;

        if (layer.assetUrl) {
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(x, y, width, height);

          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2 / viewport.zoom;
          ctx.strokeRect(x, y, width, height);

          ctx.fillStyle = '#ffffff';
          ctx.font = `${14 / viewport.zoom}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Image', x + width / 2, y + height / 2);
        }
      });

    if (selectedLayer && !selectedLayer.locked) {
      const { x, y, width, height } = selectedLayer.transform;

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2 / viewport.zoom;
      ctx.strokeRect(x, y, width, height);

      const handleSize = 8 / viewport.zoom;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3b82f6';

      const handles = [
        { x, y },
        { x: x + width, y },
        { x, y: y + height },
        { x: x + width, y: y + height },
      ];

      handles.forEach((handle) => {
        ctx.fillRect(
          handle.x - handleSize / 2,
          handle.y - handleSize / 2,
          handleSize,
          handleSize
        );
        ctx.strokeRect(
          handle.x - handleSize / 2,
          handle.y - handleSize / 2,
          handleSize,
          handleSize
        );
      });
    }

    ctx.restore();
  }, [layers, selectedLayer, viewport, frameWidth, frameHeight, frameBaseColor]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-background cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        tabIndex={0}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {ariaLiveMessage}
      </div>
    </>
  );
}
