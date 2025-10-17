import { useState } from 'react';
import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Input, Checkbox } from '../ui';
import { db } from '../../adapters/DatabaseAdapter';
import { Frame } from '@shared/types';

export interface NewFrameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  onFrameCreated: (frame: Frame) => void;
}

export function NewFrameDialog({
  open,
  onOpenChange,
  documentId,
  onFrameCreated,
}: NewFrameDialogProps) {
  const [name, setName] = useState('Untitled Frame');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [dpi, setDpi] = useState(300);
  const [baseColor, setBaseColor] = useState('#FFFFFF');
  const [usePaperColor, setUsePaperColor] = useState(false);
  const [paperColor, setPaperColor] = useState('#F5F5DC');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const frame = await db.createFrame(documentId, {
        name,
        width,
        height,
        dpi,
        baseColor,
        paperColor: usePaperColor ? paperColor : undefined,
      });

      onFrameCreated(frame);
      onOpenChange(false);

      setName('Untitled Frame');
      setWidth(1920);
      setHeight(1080);
      setDpi(300);
      setBaseColor('#FFFFFF');
      setUsePaperColor(false);
      setPaperColor('#F5F5DC');
    } catch (error) {
      console.error('Failed to create frame:', error);
      alert('Failed to create frame');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>New Frame</DialogHeader>
      <DialogBody>
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter frame name"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Width (px)"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={1}
            />
            <Input
              label="Height (px)"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={1}
            />
          </div>

          <Input
            label="DPI"
            type="number"
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value))}
            min={72}
            max={600}
          />

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Base Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="w-12 h-9 rounded border border-border cursor-pointer"
              />
              <Input
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Checkbox
              label="Use paper color overlay"
              checked={usePaperColor}
              onChange={(e) => setUsePaperColor(e.target.checked)}
            />

            {usePaperColor && (
              <div className="mt-2 ml-6">
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={paperColor}
                    onChange={(e) => setPaperColor(e.target.value)}
                    className="w-12 h-9 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={paperColor}
                    onChange={(e) => setPaperColor(e.target.value)}
                    placeholder="#F5F5DC"
                    className="flex-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isCreating}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleCreate} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
