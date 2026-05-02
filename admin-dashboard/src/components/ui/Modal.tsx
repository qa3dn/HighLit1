import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-bg/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-gray border border-border rounded-xl shadow-large p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          {title && <h2 className="text-xl font-sans font-semibold text-text">{title}</h2>}
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-accent transition-colors duration-300 p-1 hover:bg-gray-light rounded-md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-text-secondary font-sans">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
