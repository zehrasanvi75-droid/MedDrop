import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const BloodCompatibilityNotice: React.FC = () => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50/70 p-3 text-xs text-red-900 flex items-start gap-2.5">
      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
      <div className="leading-relaxed">
        <strong className="font-semibold text-red-950">Clinical Blood Product Protocol Notice:</strong>{' '}
        Blood product quantities and ABO/Rh groups are displayed for logistical discovery. Group
        matching does not supersede crossmatch verification or bedside checks. Formal release,
        cold-chain verification (2°C–6°C), and compatibility validation must be performed by certified
        medical personnel prior to transfusion.
      </div>
    </div>
  );
};
