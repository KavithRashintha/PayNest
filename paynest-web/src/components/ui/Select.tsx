import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  icon,
  error,
  className = '',
  id,
  children,
  style,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: '0.85rem',
            fontWeight: 500,
            color: '#6b7280',
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
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            {icon}
          </div>
        )}

        <select
          id={selectId}
          style={{
            width: '100%',
            height: '44px',
            backgroundColor: '#ffffff',
            color: '#111827',
            border: error ? '1px solid var(--rose-500)' : '1px solid #e5e7eb',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.925rem',
            lineHeight: '1.4',
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxSizing: 'border-box',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            ...style,
            // Ensure paddingLeft and paddingRight are strictly maintained
            paddingLeft: icon ? '42px' : '14px',
            paddingRight: '38px',
          }}
          className={`paynest-select paynest-input ${className}`}
          {...props}
        >
          {children}
        </select>

        <div
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <ChevronDown size={18} />
        </div>
      </div>

      {error && (
        <span style={{ fontSize: '0.8rem', color: 'var(--rose-500)', marginTop: '2px' }}>
          {error}
        </span>
      )}
    </div>
  );
};
