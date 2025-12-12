import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-500" />
  };

  const bgColors = {
    success: 'bg-white border-green-200 shadow-green-100',
    error: 'bg-white border-red-200 shadow-red-100',
    warning: 'bg-white border-orange-200 shadow-orange-100'
  };
  
  const textColors = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-orange-700'
  };

  return (
    <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl animate-in slide-in-from-top-5 fade-in duration-300 ${bgColors[type]}`}>
      {icons[type]}
      <p className={`text-sm font-bold ${textColors[type]}`}>{message}</p>
      <button onClick={onClose} className="ml-4 p-1 hover:bg-slate-100 rounded-full transition-colors">
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
};