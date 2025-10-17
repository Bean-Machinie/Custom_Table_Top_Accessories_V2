import { ReactNode, useEffect, useRef } from 'react';
import { Portal } from './Portal';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current === e.target) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    const activeElement = document.activeElement as HTMLElement;
    contentRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      activeElement?.focus();
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <Portal>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div
          ref={contentRef}
          className="bg-overlay border border-border rounded-token-lg shadow-elevation-3 max-w-2xl w-full max-h-[90vh] overflow-auto focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 py-4 border-b border-border">
      <h2 className="text-lg font-semibold text-text">{children}</h2>
    </div>
  );
}

export function DialogBody({ children }: { children: ReactNode }) {
  return <div className="px-6 py-4">{children}</div>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 py-4 border-t border-border flex justify-end gap-2">{children}</div>
  );
}
