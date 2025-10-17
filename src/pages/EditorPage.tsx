import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor } from '../stores/EditorContext';
import { Toolbar } from '../components/editor/Toolbar';
import { Playground } from '../components/editor/Playground';
import { LayersPanel } from '../components/editor/LayersPanel';
import { Navigator } from '../components/editor/Navigator';
import { db } from '../adapters/DatabaseAdapter';
import { assetStore } from '../adapters/AssetStoreAdapter';
import { Frame, Point } from '@shared/types';

export function EditorPage() {
  const { frameId } = useParams<{ frameId: string }>();
  const navigate = useNavigate();
  const editor = useEditor();
  const [documentId, setDocumentId] = useState<string | null>(null);

  useEffect(() => {
    if (frameId) {
      editor.loadFrame(frameId).catch((error) => {
        console.error('Failed to load frame:', error);
        navigate('/');
      });
    }
  }, [frameId, editor, navigate]);

  useEffect(() => {
    if (editor.currentFrame) {
      db.getFrame(editor.currentFrame.id).then((frame) => {
        if (frame) {
          setDocumentId(frame.documentId);
        }
      });
    }
  }, [editor.currentFrame]);

  const handleFrameCreated = useCallback(
    (frame: Frame) => {
      navigate(`/editor/${frame.id}`);
    },
    [navigate]
  );

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(5, editor.viewport.zoom * 1.2);
    editor.setViewport({ ...editor.viewport, zoom: newZoom });
  }, [editor]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(0.1, editor.viewport.zoom / 1.2);
    editor.setViewport({ ...editor.viewport, zoom: newZoom });
  }, [editor]);

  const handleZoomReset = useCallback(() => {
    editor.setViewport({ zoom: 1, panX: 0, panY: 0 });
  }, [editor]);

  const handleAddLayer = useCallback(async () => {
    if (!editor.currentFrame) return;

    try {
      const layer = await db.createLayer(editor.currentFrame.id, {
        type: 'image',
        name: `Layer ${editor.layers.filter((l) => l.type !== 'base').length + 1}`,
        transform: {
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
      });

      editor.addLayer(layer);
      editor.selectLayer(layer.id);
    } catch (error) {
      console.error('Failed to add layer:', error);
    }
  }, [editor]);

  const handleUpdateLayerVisibility = useCallback(
    async (id: string, visible: boolean) => {
      try {
        await db.updateLayer(id, { visible });
        editor.updateLayer(id, { visible });
      } catch (error) {
        console.error('Failed to update layer visibility:', error);
      }
    },
    [editor]
  );

  const handleDeleteLayer = useCallback(
    async (id: string) => {
      try {
        await editor.deleteLayer(id);
      } catch (error) {
        console.error('Failed to delete layer:', error);
      }
    },
    [editor]
  );

  const handleReorderLayers = useCallback(
    async (layers: typeof editor.layers) => {
      if (!editor.currentFrame) return;

      try {
        const layerIds = layers.map((l) => l.id);
        await db.reorderLayers(editor.currentFrame.id, layerIds);
        editor.reorderLayers(layers);
      } catch (error) {
        console.error('Failed to reorder layers:', error);
      }
    },
    [editor]
  );

  const handleUpdateLayer = useCallback(
    async (id: string, updates: Partial<typeof editor.layers[0]>) => {
      try {
        await db.updateLayer(id, updates);
        editor.updateLayer(id, updates);
      } catch (error) {
        console.error('Failed to update layer:', error);
      }
    },
    [editor]
  );

  const handleImageDrop = useCallback(
    async (file: File, position: Point) => {
      if (!editor.currentFrame) return;

      try {
        const url = await assetStore.uploadAsset(file);

        const img = new Image();
        img.onload = async () => {
          const aspectRatio = img.width / img.height;
          const width = Math.min(img.width, 400);
          const height = width / aspectRatio;

          const layer = await db.createLayer(editor.currentFrame!.id, {
            type: 'image',
            name: file.name.replace(/\.[^/.]+$/, ''),
            assetUrl: url,
            transform: {
              x: position.x - width / 2,
              y: position.y - height / 2,
              width,
              height,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
            },
          });

          editor.addLayer(layer);
          editor.selectLayer(layer.id);
        };

        img.src = url;
      } catch (error) {
        console.error('Failed to upload image:', error);
        alert('Failed to upload image');
      }
    },
    [editor]
  );

  if (editor.isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!editor.currentFrame) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-text-secondary">No frame loaded</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        currentDocumentId={documentId}
        onFrameCreated={handleFrameCreated}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        zoom={editor.viewport.zoom}
      />

      <div className="flex-1 flex overflow-hidden">
        <Playground
          layers={editor.layers}
          selectedLayerId={editor.selectedLayerId}
          viewport={editor.viewport}
          frameWidth={editor.currentFrame.width}
          frameHeight={editor.currentFrame.height}
          frameBaseColor={editor.currentFrame.baseColor}
          onSelectLayer={editor.selectLayer}
          onUpdateLayer={handleUpdateLayer}
          onViewportChange={editor.setViewport}
          onImageDrop={handleImageDrop}
        />

        <div
          className="border-l border-border bg-surface flex flex-col"
          style={{ width: 'var(--sidebar-width)' }}
        >
          <Navigator
            layers={editor.layers}
            viewport={editor.viewport}
            frameWidth={editor.currentFrame.width}
            frameHeight={editor.currentFrame.height}
            onViewportChange={editor.setViewport}
          />

          <LayersPanel
            layers={editor.layers}
            selectedLayerId={editor.selectedLayerId}
            onSelectLayer={editor.selectLayer}
            onToggleVisibility={handleUpdateLayerVisibility}
            onDeleteLayer={handleDeleteLayer}
            onReorderLayers={handleReorderLayers}
            onAddLayer={handleAddLayer}
          />
        </div>
      </div>
    </div>
  );
}
