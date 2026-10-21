import React from 'react';
import {
  CatalogSystem,
  PlacedComponent,
  SkeletonVariation,
  SpaceDimensions,
} from '../../types/builder';
import { generateBillOfMaterials } from '../../utils/layoutEngine';
import { formatDimensions, formatLength } from '../../utils/units';
import { SpaceCanvas } from '../canvas/SpaceCanvas';
import { Printer, ArrowLeft, Store, CheckSquare } from 'lucide-react';

interface Step8PrintViewProps {
  space: SpaceDimensions;
  system: CatalogSystem;
  variation: SkeletonVariation;
  placedComponents: PlacedComponent[];
  activeSaveName: string | null;
  onBack: () => void;
}

export const Step8PrintView: React.FC<Step8PrintViewProps> = ({
  space,
  system,
  variation,
  placedComponents,
  activeSaveName,
  onBack,
}) => {
  const bom = generateBillOfMaterials(system, variation, placedComponents);
  const unit = space.unit;

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Screen-Only Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            Step 8 of 8 • 8.5&quot; × 11&quot; Portrait Print Preview
          </span>
          <h1 className="text-xl font-extrabold text-slate-900">
            Print Blueprint &amp; Store Shopping Sheet
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Formatted specifically for <strong>8.5&quot; × 11&quot; portrait sheets</strong> with
            multi-page table pagination, 2D elevation diagram, brand details, and store list.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shopping List
          </button>

          <button
            type="button"
            onClick={handleTriggerPrint}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-extrabold shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF (8.5&quot; × 11&quot;)
          </button>
        </div>
      </div>

      {/* 8.5" x 11" Portrait Sheet Container */}
      <div className="print-sheet mx-auto bg-white border border-slate-300 shadow-lg rounded-xl p-6 sm:p-10 max-w-[8.5in] text-slate-900 space-y-6 print:border-none print:shadow-none print:p-0 print:max-w-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-sky-700">
              BuilderBuddy • Storage System Blueprint &amp; Parts List
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {space.wallName || 'Custom Storage Wall'}
              {activeSaveName ? ` — ${activeSaveName}` : ''}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              <strong>System:</strong> {system.brand} — {system.systemName} ({variation.title})
            </p>
          </div>

          <div className="text-right text-xs space-y-0.5 shrink-0">
            <div>
              <strong>Wall Width:</strong> {formatLength(space.widthInches, unit)}
            </div>
            <div>
              <strong>Wall Height:</strong>{' '}
              {space.hasSlopedCeiling
                ? `${formatLength(space.leftHeightInches, unit)} (L) to ${formatLength(
                    space.rightHeightInches,
                    unit
                  )} (R)`
                : formatLength(space.leftHeightInches, unit)}
            </div>
            <div>
              <strong>Room Depth:</strong> {formatLength(space.depthInches, unit)}
            </div>
            <div className="text-slate-500">
              Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Clean 2D Elevation Diagram Blueprint */}
        <div className="space-y-2 break-inside-avoid">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              1. 2D Elevation Blueprint Diagram ({variation.bays.length} Bays •{' '}
              {variation.uprights.length} Uprights • {placedComponents.length} Placed Components)
            </h3>
            <span className="text-[11px] text-slate-500">
              Measurements shown in {unit === 'cm' ? 'centimeters (cm)' : 'inches (in)'}
            </span>
          </div>

          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <SpaceCanvas
              space={space}
              viewMode="elevation"
              editableDimensions={false}
              skeleton={variation}
              placedComponents={placedComponents}
              slotIntervalInches={system.verticalSlotIntervalInches}
              blueprintMode={true}
            />
          </div>
        </div>

        {/* Itemized Parts Shopping List Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            2. Itemized Parts Shopping List ({bom.totalPartsCount} Total Pieces)
          </h3>

          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                <th className="py-2 px-2.5 border-r border-slate-300 w-8 text-center">✓</th>
                <th className="py-2 px-2.5 border-r border-slate-300">Part # (SKU)</th>
                <th className="py-2 px-2.5 border-r border-slate-300">Designation</th>
                <th className="py-2 px-2.5 border-r border-slate-300">Component &amp; Description</th>
                <th className="py-2 px-2.5 border-r border-slate-300">Measurements ({unit})</th>
                <th className="py-2 px-2.5 border-r border-slate-300 text-center">Qty</th>
                <th className="py-2 px-2.5 border-r border-slate-300 text-right">Unit</th>
                <th className="py-2 px-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bom.items.map((item) => (
                <tr key={item.sku} className="break-inside-avoid">
                  <td className="py-2 px-2.5 border-r border-slate-200 text-center text-slate-400">
                    <CheckSquare className="w-3.5 h-3.5 mx-auto" />
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {item.sku}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 uppercase text-[10px] font-bold text-slate-700 whitespace-nowrap">
                    {item.role}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-600">{item.description}</div>
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 font-medium text-slate-700 whitespace-nowrap">
                    {formatDimensions(item.dimensionsInches, unit)}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 text-center font-extrabold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 text-right text-slate-700">
                    ${item.unitPriceUsd.toFixed(2)}
                  </td>
                  <td className="py-2 px-2.5 text-right font-extrabold text-slate-900">
                    ${item.lineTotalUsd.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-900 font-extrabold text-xs">
                <td colSpan={5} className="py-2.5 px-3 text-right uppercase tracking-wider">
                  Total Parts &amp; Estimated Material Cost:
                </td>
                <td className="py-2.5 px-2.5 text-center">{bom.totalPartsCount}</td>
                <td className="py-2.5 px-2.5" />
                <td className="py-2.5 px-2.5 text-right text-sm">${bom.totalCostUsd.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* End of List: Brand Name & Retail Stores Carrying the Materials */}
        <div className="pt-4 border-t-2 border-slate-900 break-inside-avoid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl">
          <div className="space-y-1">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-sky-700" />
              Selected Brand &amp; Authorized Retail Stores
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              Brand: {system.brand} ({system.systemName})
            </div>
            <div className="text-xs text-slate-700">
              <strong>Stores Carrying These Materials:</strong> {system.stores.join('  •  ')}
            </div>
          </div>

          <div className="text-xs text-slate-600 max-w-xs sm:text-right">
            <strong>Mounting Note:</strong> Designed for standard drywall hollow-wall toggle anchors
            where wall studs do not align with bay widths.
          </div>
        </div>
      </div>
    </div>
  );
};
