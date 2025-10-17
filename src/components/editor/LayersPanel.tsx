import { Layer } from '@shared/types';
import { IconButton, Button } from '../ui';

export interface LayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayers: (layers: Layer[]) => void;
  onAddLayer: () => void;
}

export function LayersPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onDeleteLayer,
  onReorderLayers,
  onAddLayer,
}: LayersPanelProps) {
  const handleMoveUp = (index: number) => {
    if (index === layers.length - 1) return;
    const newLayers = [...layers];
    [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    onReorderLayers(newLayers);
  };

  const handleMoveDown = (index: number) => {
    if (index === 0) return;
    const newLayers = [...layers];
    [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
    onReorderLayers(newLayers);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Layers</h3>
        <Button size="sm" onClick={onAddLayer}>
          + Add Layer
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-text-muted">
            No layers yet
          </div>
        ) : (
          <div className="py-2">
            {[...layers].reverse().map((layer, reversedIndex) => {
              const index = layers.length - 1 - reversedIndex;
              const isSelected = layer.id === selectedLayerId;

              return (
                <div
                  key={layer.id}
                  className={`px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-border-subtle ${
                    isSelected ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => onSelectLayer(layer.id)}
                >
                  <IconButton
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layer.id, !layer.visible);
                    }}
                    title={layer.visible ? 'Hide' : 'Show'}
                  >
                    {layer.visible ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3C4.5 3 1.7 5.6 1 8c.7 2.4 3.5 5 7 5s6.3-2.6 7-5c-.7-2.4-3.5-5-7-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 2l12 12M8 5c1.7 0 3 1.3 3 3 0 .5-.1 1-.3 1.4l-1.8-1.8c0-.2.1-.4.1-.6 0-.6-.4-1-1-1-.2 0-.4 0-.6.1L5.6 4.3C6.4 4.6 7.2 5 8 5z" />
                      </svg>
                    )}
                  </IconButton>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text truncate">
                      {layer.name}
                    </div>
                    <div className="text-xs text-text-muted">
                      {layer.type}
                      {layer.locked && ' • Locked'}
                    </div>
                  </div>

                  {!layer.locked && (
                    <div className="flex gap-1">
                      <IconButton
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveUp(index);
                        }}
                        disabled={index === layers.length - 1}
                        title="Move Up"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M6 3l4 4H2z" />
                        </svg>
                      </IconButton>
                      <IconButton
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveDown(index);
                        }}
                        disabled={index === 0 || layer.locked}
                        title="Move Down"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M6 9L2 5h8z" />
                        </svg>
                      </IconButton>
                      <IconButton
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete layer "${layer.name}"?`)) {
                            onDeleteLayer(layer.id);
                          }
                        }}
                        title="Delete"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M3 3l6 6M9 3L3 9" />
                        </svg>
                      </IconButton>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
