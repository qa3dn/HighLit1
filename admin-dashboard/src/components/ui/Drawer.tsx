import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}

/** RTL slide-over: full-width on mobile, max-w-xl on desktop. Backdrop click +
 * Esc close, body scroll lock. Rendered via a portal to document.body. */
export const Drawer = ({ open, onClose, title, children }: DrawerProps) => {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-md" onClick={onClose} />
      <aside
        dir="rtl"
        className="absolute inset-y-0 left-0 flex w-full max-w-xl flex-col border-r border-border bg-gray shadow-large animate-fade-in"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold text-text">{title}</h2>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-gray-light hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>,
    document.body,
  );
};
