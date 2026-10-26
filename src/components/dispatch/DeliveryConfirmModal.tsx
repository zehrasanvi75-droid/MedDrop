import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { SupplyRequest } from '@/types';
import { useAuth } from '@/context/AuthContext';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShieldCheck, PackageCheck, UserCheck } from 'lucide-react';

interface DeliveryConfirmModalProps {
  request: SupplyRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (requestId: string, receiverName: string) => Promise<void>;
}

export const DeliveryConfirmModal: React.FC<DeliveryConfirmModalProps> = ({
  request,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { currentProfile } = useAuth();
  const [receiverName, setReceiverName] = useState(currentProfile?.full_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('Cold-chain integrity verified intact upon handover.');

  React.useEffect(() => {
    if (currentProfile) {
      setReceiverName(currentProfile.full_name);
    }
  }, [currentProfile]);

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim()) return;

    try {
      setIsSubmitting(true);
      await onConfirm(request.id, receiverName.trim());

      // Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'],
        });
      } catch {}

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
      title="Confirm Receipt & Check Into Local Inventory"
      subtitle={`${request.request_code} — ${request.quantity_requested}x ${request.item?.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
          <PackageCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Supplies Handover Verification</p>
            <p className="text-emerald-900 leading-relaxed">
              Confirming receipt will automatically add <strong>{request.quantity_requested} units</strong>{' '}
              to <strong>{request.requesting_facility?.name}</strong> local inventory and close this dispatch
              cycle with a verified audit timestamp.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Receiving Officer / Field Surgeon Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Handover & Condition Note
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            size="md"
            isLoading={isSubmitting}
            className="font-bold shadow-md shadow-emerald-900/10"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Delivery & Restock</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
