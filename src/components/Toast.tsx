import React from 'react';

interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      id="toast"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifySpace: 'space-between',
        gap: '12px',
        maxWidth: '90vw',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold',
            marginLeft: '6px'
          }}
          title="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};
