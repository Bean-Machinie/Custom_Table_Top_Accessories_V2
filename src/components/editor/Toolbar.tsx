import { useState } from 'react';
import { Menu, IconButton } from '../ui';
import { NewFrameDialog } from './NewFrameDialog';
import { Frame } from '@shared/types';

export interface ToolbarProps {
  currentDocumentId: string | null;
  onFrameCreated: (frame: Frame) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  zoom: number;
}

export function Toolbar({
  currentDocumentId,
  onFrameCreated,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoom,
}: ToolbarProps) {
  const [showNewFrameDialog, setShowNewFrameDialog] = useState(false);

  return (
    <>
      <div
        className="h-12 border-b border-border bg-surface flex items-center justify-between px-4"
        style={{ height: 'var(--toolbar-height)' }}
      >
        <div className="flex items-center gap-2">
          <Menu.Root>
            <Menu.Trigger>
              <button className="px-3 py-1.5 text-sm font-medium text-text hover:bg-border-subtle rounded-token-sm">
                File
              </button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item
                onSelect={() => setShowNewFrameDialog(true)}
                disabled={!currentDocumentId}
              >
                New Frame
              </Menu.Item>
            </Menu.Content>
          </Menu.Root>

          <Menu.Root>
            <Menu.Trigger>
              <button className="px-3 py-1.5 text-sm font-medium text-text hover:bg-border-subtle rounded-token-sm">
                Edit
              </button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item disabled>Undo</Menu.Item>
              <Menu.Item disabled>Redo</Menu.Item>
            </Menu.Content>
          </Menu.Root>

          <Menu.Root>
            <Menu.Trigger>
              <button className="px-3 py-1.5 text-sm font-medium text-text hover:bg-border-subtle rounded-token-sm">
                View
              </button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item onSelect={onZoomIn}>Zoom In</Menu.Item>
              <Menu.Item onSelect={onZoomOut}>Zoom Out</Menu.Item>
              <Menu.Item onSelect={onZoomReset}>Reset Zoom</Menu.Item>
            </Menu.Content>
          </Menu.Root>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-text-secondary">
            {Math.round(zoom * 100)}%
          </div>
          <IconButton onClick={onZoomOut} title="Zoom Out">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 7h12v2H2z" />
            </svg>
          </IconButton>
          <IconButton onClick={onZoomIn} title="Zoom In">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7 2v5H2v2h5v5h2V9h5V7H9V2z" />
            </svg>
          </IconButton>
          <IconButton onClick={onZoomReset} title="Reset Zoom">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2C4.7 2 2 4.7 2 8s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
            </svg>
          </IconButton>
        </div>
      </div>

      {currentDocumentId && (
        <NewFrameDialog
          open={showNewFrameDialog}
          onOpenChange={setShowNewFrameDialog}
          documentId={currentDocumentId}
          onFrameCreated={onFrameCreated}
        />
      )}
    </>
  );
}
