import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'error', message, onClose }) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          icon: <CheckCircle2 size={18} color="#34d399" />,
        };
      case 'info':
        return {
          bg: 'rgba(99, 102, 241, 0.12)',
          border: 'rgba(99, 102, 241, 0.3)',
          color: '#818cf8',
          icon: <Info size={18} color="#818cf8" />,
        };
      default:
        return {
          bg: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.3)',
          color: '#fb7185',
          icon: <AlertCircle size={18} color="#fb7185" />,
        };
    }
  };

  const style = getStyles();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-md)',
        color: style.color,
        fontSize: '0.875rem',
        gap: '12px',
        width: '100%',
      }}
      className="animate-fade-in"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {style.icon}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: style.color,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.8,
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
