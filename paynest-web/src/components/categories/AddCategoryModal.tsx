import React, { useState } from 'react';
import {
  X,
  Tag,
  ArrowRight,
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Briefcase,
  Tv,
  HeartPulse,
  GraduationCap,
  Plane,
  Gift,
  Zap,
  Coffee,
  Smartphone,
  Smile,
  Shield,
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { categoriesApi } from '../../api/categories';
import type { CategoryType } from '../../types/finance';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_ICONS = [
  { name: 'Utensils', icon: <Utensils size={20} /> },
  { name: 'ShoppingBag', icon: <ShoppingBag size={20} /> },
  { name: 'Car', icon: <Car size={20} /> },
  { name: 'Home', icon: <Home size={20} /> },
  { name: 'Briefcase', icon: <Briefcase size={20} /> },
  { name: 'Tv', icon: <Tv size={20} /> },
  { name: 'HeartPulse', icon: <HeartPulse size={20} /> },
  { name: 'GraduationCap', icon: <GraduationCap size={20} /> },
  { name: 'Plane', icon: <Plane size={20} /> },
  { name: 'Gift', icon: <Gift size={20} /> },
  { name: 'Zap', icon: <Zap size={20} /> },
  { name: 'Coffee', icon: <Coffee size={20} /> },
  { name: 'Smartphone', icon: <Smartphone size={20} /> },
  { name: 'Smile', icon: <Smile size={20} /> },
  { name: 'Shield', icon: <Shield size={20} /> },
  { name: 'Tag', icon: <Tag size={20} /> },
];

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#3b82f6', // Blue
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('EXPENSE');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }

    try {
      setIsLoading(true);
      await categoriesApi.createCategory({
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: selectedColor,
      });

      // Reset form
      setName('');
      setType('EXPENSE');
      setSelectedIcon('Tag');
      setSelectedColor('#6366f1');
      setError(null);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create category:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create custom category. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#0f1420',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tag size={22} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>Add Category</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Create a custom spending or income category
            </span>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          {/* Category Type Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Category Type
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: type === 'EXPENSE' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                  color: type === 'EXPENSE' ? 'var(--rose-500)' : 'var(--text-secondary)',
                  fontWeight: type === 'EXPENSE' ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Expense Category
              </button>
              <button
                type="button"
                onClick={() => setType('INCOME')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: type === 'INCOME' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: type === 'INCOME' ? 'var(--emerald-400)' : 'var(--text-secondary)',
                  fontWeight: type === 'INCOME' ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Income Category
              </button>
            </div>
          </div>

          {/* Category Name Input */}
          <Input
            label="Category Name"
            placeholder="e.g. Subscriptions, Groceries, Salary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<Tag size={18} />}
            required
          />

          {/* Color Picker Palette */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Category Color
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: selectedColor === c ? '2px solid #ffffff' : 'none',
                    boxShadow: selectedColor === c ? `0 0 12px ${c}` : 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                    transform: selectedColor === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}

              {/* Custom Color Input */}
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
                title="Choose custom color"
              />
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Choose Icon
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '8px',
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {CATEGORY_ICONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor:
                      selectedIcon === item.name ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    border:
                      selectedIcon === item.name
                        ? '1px solid var(--indigo-500)'
                        : '1px solid transparent',
                    color: selectedIcon === item.name ? selectedColor : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} fullWidth>
              Create Category
              <ArrowRight size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
