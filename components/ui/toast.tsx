'use client';

import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'error';
  duration?: number;
  onRemove: (id: string) => void;
}

export function Toast({ id, message, type = 'success', duration = 4000, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 min-w-80 max-w-md p-4 
        rounded-xl border backdrop-blur-sm shadow-lg
        transition-all duration-300 ease-in-out
        ${isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 translate-x-full'
        }
        ${type === 'success' 
          ? 'bg-green-50/90 border-green-200 text-green-800' 
          : 'bg-red-50/90 border-red-200 text-red-800'
        }
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>
        
        <button
          onClick={handleClose}
          className={`
            flex-shrink-0 p-1 rounded-full transition-colors
            ${type === 'success' 
              ? 'hover:bg-green-100 text-green-600' 
              : 'hover:bg-red-100 text-red-600'
            }
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'error') => void;
}

import { createContext, useContext, ReactNode } from 'react';

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onRemove={removeToast}
        />
      ))}
    </ToastContext.Provider>
  );
}