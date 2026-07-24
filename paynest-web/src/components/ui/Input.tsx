import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  type = 'text',
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.85rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '14px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}

        <input
          id={inputId}
          type={inputType}
          style={{
            width: '100%',
            padding: icon ? '12px 40px 12px 42px' : isPassword ? '12px 42px 12px 14px' : '12px 14px',
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-primary)',
            border: error ? '1px solid var(--rose-500)' : '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.925rem',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          className={`paynest-input ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--rose-500)', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
};
