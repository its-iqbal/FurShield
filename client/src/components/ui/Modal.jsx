import { useEffect } from 'react';

/**
 * Reusable modal overlay — warm, clinical-but-gentle per DESIGN.md.
 * Props:
 *  - isOpen:   boolean
 *  - onClose:  () => void
 *  - title:    string
 *  - size:     'sm' | 'md' | 'lg' | 'xl'  (default 'md')
 *  - children: React node
 */
const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ isOpen, onClose, title, size = 'md', children }) {
  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop — warm semi-transparent, not pure black */}
      <div
        className="absolute inset-0 bg-[#33302B]/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel — card-surface with warm shadow */}
      <div
        className={`relative w-full ${sizeMap[size]} bg-white border border-[#E8E2D9]
          rounded-2xl shadow-warm-lg animate-slide-up
          max-h-[90vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E2D9] flex-shrink-0">
          <h2 id="modal-title" className="font-['Fraunces'] text-xl font-semibold text-primary-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted
              hover:text-body hover:bg-primary-100 transition-colors duration-150"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-6 text-body">
          {children}
        </div>
      </div>
    </div>
  );
}
