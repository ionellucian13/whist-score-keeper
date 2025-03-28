import React, { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ message, onConfirm, onCancel }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Focus pe modal când se deschide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-neutral-900 bg-opacity-50 backdrop-blur-sm"
        onClick={onCancel}
      ></div>
      
      <div
        ref={modalRef}
        className="relative z-50 w-full max-w-md animate-fade-in mx-4"
      >
        <div className="bg-app-surface rounded-radius-xl shadow-app-elevation-4 overflow-hidden">
          <div className="p-6">
            <div className="flex mb-4">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 rounded-full bg-warning-surface flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning-color" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-app-text-primary mb-2">Confirmare</h3>
                <p className="text-app-text-secondary">{message}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="btn btn-outline px-4 py-2"
                onClick={onCancel}
              >
                Anulează
              </button>
              <button
                className="btn btn-warning px-4 py-2"
                onClick={onConfirm}
              >
                Confirmă
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 