import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Adicionar estilos CSS inline para animações
const modalStyles = `
  @keyframes modalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modalSlideUp {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

// Injetar estilos no head se ainda não existirem
if (typeof document !== 'undefined' && !document.getElementById('modal-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'modal-animations';
  styleSheet.innerText = modalStyles;
  document.head.appendChild(styleSheet);
}

export type ModalVariant = 'default' | 'entrada' | 'saida';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: ModalVariant;
  icon?: React.ReactNode;
}

const variantStyles: Record<ModalVariant, { gradient: string; iconBg: string; accent: string }> = {
  default: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    iconBg: 'rgba(255,255,255,0.2)',
    accent: '#818cf8',
  },
  entrada: {
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
    iconBg: 'rgba(255,255,255,0.2)',
    accent: '#10b981',
  },
  saida: {
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
    iconBg: 'rgba(255,255,255,0.2)',
    accent: '#ef4444',
  },
};

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle,
  children,
  variant = 'default',
  icon,
}) => {
  // Fechar modal com tecla ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const styles = variantStyles[variant];

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'modalFadeIn 0.25s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '0px',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0,0,0,0.04)',
          animation: 'modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header com gradiente contextual */}
        <div style={{
          position: 'relative',
          padding: '28px 32px 24px',
          background: styles.gradient,
          overflow: 'hidden',
        }}>
          {/* Elementos decorativos de fundo */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '40%',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {icon && (
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: styles.iconBg,
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  {icon}
                </div>
              )}
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.01em',
                }}>{title}</h2>
                {subtitle && (
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.75)',
                    fontWeight: 500,
                  }}>{subtitle}</p>
                )}
              </div>
            </div>

            <button 
              onClick={onClose} 
              style={{ 
                background: 'rgba(255,255,255,0.15)', 
                border: '1px solid rgba(255,255,255,0.15)', 
                fontSize: '18px', 
                cursor: 'pointer',
                color: '#ffffff',
                borderRadius: '12px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                marginTop: '2px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ 
          padding: '28px 32px 32px',
          maxHeight: 'calc(90vh - 120px)',
          overflowY: 'auto',
        }}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default Modal;
