import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { InventoryItem } from '@/types';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/context/AuthContext';

interface InventoryAdjustModalProps {
  inventory: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InventoryAdjustModal: React.FC<InventoryAdjustModalProps> = ({
  inventory,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentProfile } = useAuth();
  const [quantity, setQuantity] = useState<number>(inventory?.quantity_on_hand ?? 0);
  const [minThreshold, setMinThreshold] = useState<number>(inventory?.min_threshold ?? 5);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (inventory) {
      setQuantity(inventory.quantity_on_hand);
      setMinThreshold(inventory.min_threshold);
      setNotes('');
      setError(null);
    }
  }, [inventory]);

  if (!inventory) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please provide a reason or audit note for the inventory adjustment.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await dataService.adjustInventory(
        inventory.id,
        Number(quantity),
        Number(minThreshold),
        currentProfile.id,
        notes
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to adjust inventory');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Physical Inventory Count"
      subtitle={`${inventory.facility?.name} — ${inventory.item?.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity On Hand ({inventory.item?.unit})
            </label>
            <input
              type="number"
              min={inventory.quantity_reserved}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(inventory.quantity_reserved, Number(e.target.value)))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            {inventory.quantity_reserved > 0 && (
              <p className="text-[11px] text-amber-700 mt-1">
                Min {inventory.quantity_reserved} (reserved for active dispatches)
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Low Stock Threshold
            </label>
            <input
              type="number"
              min="0"
              value={minThreshold}
              onChange={(e) => setMinThreshold(Math.max(0, Number(e.target.value)))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason for Adjustment <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Physical count verification, restock received from depot, damaged vial removed"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Confirm Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
