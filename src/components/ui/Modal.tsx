import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  footer?: React.ReactNode
}

const sizeMap = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  '2xl':'max-w-5xl',
  '3xl':'max-w-7xl',
  full: 'max-w-6xl',
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, size = 'md', footer }) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className={`relative w-full ${sizeMap[size]} bg-surface-card border border-surface-border
                    rounded-2xl shadow-card-light animate-slide-in flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border shrink-0">
          <h3 className="text-base font-bold text-text-primary">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors -mr-1.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-surface-border flex items-center justify-end gap-3 shrink-0 bg-surface-hover">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
