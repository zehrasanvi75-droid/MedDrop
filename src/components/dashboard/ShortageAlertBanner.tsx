import React from 'react';
import { InventoryItem } from '@/types';
import { AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface ShortageAlertBannerProps {
  criticalItems: InventoryItem[];
  onRequestSupply: (item?: InventoryItem) => void;
}

export const ShortageAlertBanner: React.FC<ShortageAlertBannerProps> = ({
  criticalItems,
  onRequestSupply,
}) => {
  if (criticalItems.length === 0) return null;

  const topShortage = criticalItems[0];
  const totalCount = criticalItems.length;

  return (
    <div className="rounded-xl border border-red-300 bg-red-50/90 p-4 sm:p-5 shadow-sm text-red-950 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-lg bg-red-600 text-white shrink-0 mt-0.5 shadow-md shadow-red-300">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
              CRITICAL SHORTAGE DETECTED
            </span>
            <span className="text-xs font-semibold text-red-800">
              {topShortage.facility?.name || 'Local Facility'}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-red-950 mt-1">
            {topShortage.item?.name}:{' '}
            <span className="text-red-700 underline decoration-red-400">
              {topShortage.quantity_on_hand} {topShortage.item?.unit} available
            </span>{' '}
            (Threshold: {topShortage.min_threshold})
          </h3>

          <p className="text-xs text-red-800/90 mt-1 max-w-2xl">
            {topShortage.item?.is_blood_product
              ? 'Zero blood bank inventory for universal resuscitation. Patient risk level is SEVERE.'
              : 'Inventory is depleted below operational safety threshold. Immediate emergency resupply advised.'}
            {totalCount > 1 && (
              <span className="font-semibold ml-1">
                (+{totalCount - 1} other items low or depleted)
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
        <Button
          variant="destructive"
          size="md"
          onClick={() => onRequestSupply(topShortage)}
          className="shadow-md shadow-red-900/20"
        >
          <span>Request Emergency Supply</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
