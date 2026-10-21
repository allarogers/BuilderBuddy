import React from 'react';
import {
  CatalogSystem,
  PlacedComponent,
  SkeletonVariation,
  SpaceDimensions,
} from '../../types/builder';
import { generateBillOfMaterials } from '../../utils/layoutEngine';
import { formatDimensions } from '../../utils/units';
import {
  ShoppingCart,
  Printer,
  ArrowLeft,
  Store,
  Package,
  CheckCircle2,
} from 'lucide-react';

interface Step7ShoppingListProps {
  space: SpaceDimensions;
  system: CatalogSystem;
  variation: SkeletonVariation;
  placedComponents: PlacedComponent[];
  onNextToPrint: () => void;
  onBack: () => void;
}

export const Step7ShoppingList: React.FC<Step7ShoppingListProps> = ({
  space,
  system,
  variation,
  placedComponents,
  onNextToPrint,
  onBack,
}) => {
  const bom = generateBillOfMaterials(system, variation, placedComponents);
  const unit = space.unit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            Step 7 of 8 • Bill of Materials & Shopping List
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Complete Parts Shopping List ({system.systemName})
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Every track, upright standard, shelf, drawer, bracket pair, and drywall anchor pack
            required for <strong>{space.wallName}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={onNextToPrint}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-sm transition self-start cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Open 8.5&quot;×11&quot; Print View</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Selected System &amp; Brand
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1">{system.systemName}</div>
          <div className="text-xs text-slate-600 mt-0.5">{system.brand}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Components &amp; Hardware
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1">
            {bom.totalPartsCount} Total Pieces ({bom.items.length} Unique SKUs)
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Includes auto-matched brackets &amp; drywall anchors
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
            Estimated Total Cost
          </div>
          <div className="text-2xl font-extrabold text-white mt-0.5">
            ${bom.totalCostUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-300">
            Available at: {system.stores.join(', ')}
          </div>
        </div>
      </div>

      {/* Grouped Itemized Shopping Table */}
      <div className="space-y-5">
        {Object.entries(bom.groupedItems).map(([groupTitle, groupItems]) => (
          <div
            key={groupTitle}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
          >
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-600" />
                {groupTitle}
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {groupItems.reduce((s, i) => s + i.quantity, 0)} pcs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/40">
                    <th className="py-2.5 px-4">Part # (SKU)</th>
                    <th className="py-2.5 px-4">Component &amp; Designation</th>
                    <th className="py-2.5 px-4">Measurements ({unit})</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {groupItems.map((item) => (
                    <tr key={item.sku} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <span className="inline-block mt-0.5 text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-sky-50 text-sky-800 border border-sky-200">
                          {item.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {formatDimensions(item.dimensionsInches, unit)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs">{item.description}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-100 font-extrabold text-slate-900">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-700">
                        ${item.unitPriceUsd.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        ${item.lineTotalUsd.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Where to Buy Footer Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Store className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Retail Stores Carrying {system.brand}
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {system.stores.join('  •  ')}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Grand Total Estimate</div>
          <div className="text-xl font-extrabold text-slate-900">
            ${bom.totalCostUsd.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shelf Designer
        </button>

        <button
          type="button"
          onClick={onNextToPrint}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-sm transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Proceed to Print View (8.5&quot; × 11&quot; Portrait)</span>
        </button>
      </div>
    </div>
  );
};
