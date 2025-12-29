
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; onReset?: () => void }> = ({ children, className = "", title, onReset }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {(title || onReset) && (
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
        {onReset && (
          <button 
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <span>🔄</span> 重置
          </button>
        )}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, loading, variant = 'primary', className = "", ...props }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
