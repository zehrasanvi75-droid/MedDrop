import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'critical' | 'warning' | 'info' | 'success';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const variantStyles = {
    default: {
      card: 'bg-white border-slate-200 hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-700',
      badge: 'text-slate-600 bg-slate-50',
    },
    critical: {
      card: 'bg-red-50/50 border-red-200 hover:border-red-300',
      iconBg: 'bg-red-600 text-white shadow-sm shadow-red-200',
      badge: 'text-red-700 bg-red-100/60 font-semibold',
    },
    warning: {
      card: 'bg-amber-50/40 border-amber-200 hover:border-amber-300',
      iconBg: 'bg-amber-500 text-slate-900 shadow-sm shadow-amber-200',
      badge: 'text-amber-800 bg-amber-100/60 font-semibold',
    },
    info: {
      card: 'bg-blue-50/40 border-blue-200 hover:border-blue-300',
      iconBg: 'bg-blue-600 text-white shadow-sm shadow-blue-200',
      badge: 'text-blue-700 bg-blue-100/60 font-semibold',
    },
    success: {
      card: 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300',
      iconBg: 'bg-emerald-600 text-white shadow-sm shadow-emerald-200',
      badge: 'text-emerald-800 bg-emerald-100/60 font-semibold',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border p-4 sm:p-5 transition-all shadow-sm',
        style.card,
        onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99]' : ''
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          {title}
        </span>
        <div className={cn('p-2.5 rounded-lg flex items-center justify-center', style.iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          {value}
        </span>
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
