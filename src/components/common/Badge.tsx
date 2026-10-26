import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'critical' | 'info' | 'tactical' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 leading-tight font-semibold uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200',
    tactical: 'bg-slate-900 text-slate-200 border border-slate-700 font-mono',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    critical: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    outline: 'bg-transparent text-slate-700 border border-slate-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-sans border transition-colors',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
