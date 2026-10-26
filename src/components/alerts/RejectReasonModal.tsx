import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { SupplyRequest } from '@/types';
import { AlertCircle } from 'lucide-react';

interface RejectReasonModalProps {
  request: SupplyRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  request,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reasonCategory, setReasonCategory] = useState('Stock earmarked for local surgical emergencies');
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetReasons = [
    'Stock earmarked for active local surgical emergencies',
    'Cold-chain transport vehicle currently unavailable',
    'Extreme weather condition grounding air & ground transit',
    'Item near-expiry or undergoing quarantine verification',
    'Other operational conflict',
  ];

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customNote.trim()
      ? `${reasonCategory} — ${customNote.trim()}`
      : reasonCategory;

    try {
      setIsSubmitting(true);
      await onConfirm(finalReason);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Emergency Supply Request"
      subtitle={`Specify official operational reason for rejecting ${request.request_code}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Rejection triggers an immediate rerouting alert back to the requesting camp and the central
            command grid. A documented justification is required for the audit trail.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Primary Reason Category <span className="text-red-500">*</span>
          </label>
          <select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            required
          >
            {presetReasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Additional Tactical Operational Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Expected triage influx from mountain sector, helicopter grounded by fog"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="destructive" size="sm" isLoading={isSubmitting}>
            Confirm Rejection
          </Button>
        </div>
      </form>
    </Modal>
  );
};
