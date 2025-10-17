import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  cloneElement,
  isValidElement,
} from 'react';
import { Portal } from './Portal';

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('Menu components must be used within Menu.Root');
  return context;
}

interface MenuRootProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function MenuRoot({ children, open: controlledOpen, defaultOpen = false, onOpenChange }: MenuRootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLElement>(null);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <MenuContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </MenuContext.Provider>
  );
}

interface MenuTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

function MenuTrigger({ children, asChild }: MenuTriggerProps) {
  const { setOpen, triggerRef } = useMenu();

  if (asChild && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onClick: () => setOpen(true),
    });
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      onClick={() => setOpen(true)}
      className="inline-flex items-center justify-center"
    >
      {children}
    </button>
  );
}

interface MenuContentProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

function MenuContent({ children, align = 'start', side = 'bottom' }: MenuContentProps) {
  const { open, setOpen, triggerRef } = useMenu();
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const contentRect = contentRef.current?.getBoundingClientRect();

      let top = 0;
      let left = 0;

      if (side === 'bottom') {
        top = triggerRect.bottom + 4;
      } else if (side === 'top') {
        top = triggerRect.top - (contentRect?.height || 0) - 4;
      }

      if (align === 'start') {
        left = triggerRect.left;
      } else if (align === 'center') {
        left = triggerRect.left + triggerRect.width / 2 - (contentRect?.width || 0) / 2;
      } else if (align === 'end') {
        left = triggerRect.right - (contentRect?.width || 0);
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, align, side, triggerRef]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = contentRef.current?.querySelectorAll('[role="menuitem"]');
      if (!items) return;

      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setFocusedIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setFocusedIndex(items.length - 1);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen, triggerRef]);

  useEffect(() => {
    if (!open) return;
    const items = contentRef.current?.querySelectorAll('[role="menuitem"]');
    if (items && items[focusedIndex]) {
      (items[focusedIndex] as HTMLElement).focus();
    }
  }, [focusedIndex, open]);

  if (!open) return null;

  return (
    <Portal>
      <div
        ref={contentRef}
        className="absolute z-50 min-w-[180px] bg-overlay border border-border rounded-token-md shadow-elevation-2 py-1"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
        role="menu"
      >
        {children}
      </div>
    </Portal>
  );
}

interface MenuItemProps {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
}

function MenuItem({ children, onSelect, disabled }: MenuItemProps) {
  const { setOpen } = useMenu();

  return (
    <button
      role="menuitem"
      disabled={disabled}
      className="w-full px-3 h-8 flex items-center text-sm text-text hover:bg-border-subtle focus:bg-border-subtle focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => {
        if (!disabled) {
          onSelect?.();
          setOpen(false);
        }
      }}
    >
      {children}
    </button>
  );
}

function MenuSeparator() {
  return <div className="h-px bg-border my-1" role="separator" />;
}

export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Separator: MenuSeparator,
};
