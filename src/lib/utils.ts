import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RequestStatus, RequestUrgency, PatientStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const past = new Date(dateString).getTime();
    const now = Date.now();
    const diffSecs = Math.max(0, Math.floor((now - past) / 1000));

    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return dateString;
  }
}

export function getUrgencyBadgeStyle(urgency: RequestUrgency) {
  switch (urgency) {
    case 'critical':
      return {
        bg: 'bg-red-600 text-white border-red-700 animate-pulse',
        pill: 'bg-red-50 text-red-700 border-red-200',
        label: 'CRITICAL',
      };
    case 'high':
      return {
        bg: 'bg-amber-500 text-slate-900 border-amber-600',
        pill: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'HIGH PRIORITY',
      };
    case 'moderate':
      return {
        bg: 'bg-blue-600 text-white border-blue-700',
        pill: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'MODERATE',
      };
  }
}

export function getStatusBadgeStyle(status: RequestStatus) {
  switch (status) {
    case 'requested':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'Awaiting Hub',
        dot: 'bg-amber-500',
      };
    case 'accepted':
      return {
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        label: 'Accepted / Reserved',
        dot: 'bg-blue-500',
      };
    case 'dispatched':
    case 'in_transit':
      return {
        bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        label: 'In Transit',
        dot: 'bg-indigo-500 animate-ping',
      };
    case 'delivered':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'Delivered',
        dot: 'bg-emerald-500',
      };
    case 'rejected':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        label: 'Rejected',
        dot: 'bg-rose-500',
      };
    case 'cancelled':
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        label: 'Cancelled',
        dot: 'bg-slate-400',
      };
  }
}

export function getPatientStatusStyle(status: PatientStatus) {
  switch (status) {
    case 'incoming':
      return {
        label: 'Patient Incoming',
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
      };
    case 'on_site':
      return {
        label: 'Patient On Site',
        bg: 'bg-orange-100 text-orange-800 border-orange-300',
      };
    case 'stabilized':
      return {
        label: 'Patient Stabilized',
        bg: 'bg-slate-100 text-slate-800 border-slate-300',
      };
  }
}
