import React from 'react';

interface StockBadgeProps {
  quantityOnHand: number;
  quantityReserved: number;
  minThreshold: number;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  quantityOnHand,
  quantityReserved,
  minThreshold,
}) => {
  const available = Math.max(0, quantityOnHand - quantityReserved);

  if (available === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-red-600" />
        CRITICAL DEPLETED (0)
      </span>
    );
  }

  if (available < minThreshold) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <span className="w-2 h-2 rounded-full bg-amber-600" />
        LOW STOCK ({available})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
      <span className="w-2 h-2 rounded-full bg-emerald-600" />
      ADEQUATE ({available})
    </span>
  );
};
