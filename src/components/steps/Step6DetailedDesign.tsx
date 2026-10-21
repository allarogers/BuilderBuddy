import React, { useState } from 'react';
import {
  CatalogComponent,
  CatalogSystem,
  PlacedComponent,
  SkeletonVariation,
  SpaceDimensions,
} from '../../types/builder';
import { SpaceCanvas } from '../canvas/SpaceCanvas';
import { snapToSlotInterval } from '../../utils/layoutEngine';
import { formatLength } from '../../utils/units';
import {
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Layers,
  Wand2,
  RotateCcw,
  ShoppingCart,
} from 'lucide-react';

interface Step6DetailedDesignProps {
  space: SpaceDimensions;
  system: CatalogSystem;
  variation: SkeletonVariation;
  placedComponents: PlacedComponent[];
  onUpdatePlacedComponents: (items: PlacedComponent[]) => void;
  onAutoPopulateStarter: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step6DetailedDesign: React.FC<Step6DetailedDesignProps> = ({
  space,
  system,
  variation,
  placedComponents,
  onUpdatePlacedComponents,
  onAutoPopulateStarter,
  onNext,
  onBack,
}) => {
  const [selectedBayIndex, setSelectedBayIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'elevation' | 'top'>('elevation');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const unit = space.unit;
  const activeBay =
    variation.bays.find((b) => b.bayIndex === selectedBayIndex) || variation.bays[0];

  // Filter catalog components that fit the currently selected bay width (within 0.6" tolerance)
  const placeableRoles = ['shelf', 'drawer', 'basket', 'rod', 'pegboard'];
  const compatibleComponents = system.components.filter((comp) => {
    if (!placeableRoles.includes(comp.role)) return false;
    if (roleFilter !== 'all' && comp.role !== roleFilter) return false;
    if (!activeBay) return false;
    return Math.abs(comp.dimensionsInches.width - activeBay.widthInches) < 0.6;
  });

  const handleAddComponentToBay = (comp: CatalogComponent, targetBayIndex: number) => {
    const bay = variation.bays.find((b) => b.bayIndex === targetBayIndex);
    if (!bay) return;

    const minY = Math.max(
      bay.floorOffsetInches + 6,
      bay.topTrackYInches - Math.min(bay.leftUprightHeightInches, bay.rightUprightHeightInches) + 4
    );
    const maxY = bay.topTrackYInches - comp.dimensionsInches.height - 3;

    // Find an open vertical height in this bay
    const existingInBay = placedComponents
      .filter((c) => c.bayIndex === targetBayIndex)
      .map((c) => c.yFromFloorInches)
      .sort((a, b) => a - b);

    let candidateY = (minY + maxY) / 2;
    if (existingInBay.length > 0) {
      // Try placing 14" above the highest or below the lowest
      const highest = existingInBay[existingInBay.length - 1];
      if (highest + 14 <= maxY) {
        candidateY = highest + 14;
      } else {
        const lowest = existingInBay[0];
        candidateY = Math.max(minY, lowest - 14);
      }
    }

    const snappedY = snapToSlotInterval(
      candidateY,
      system.verticalSlotIntervalInches,
      minY,
      maxY
    );

    const newItem: PlacedComponent = {
      id: `placed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bayIndex: targetBayIndex,
      sku: comp.sku,
      name: comp.name,
      role: comp.role,
      subType: comp.subType,
      line: comp.line,
      widthInches: comp.dimensionsInches.width,
      depthInches: comp.dimensionsInches.depth,
      heightInches: comp.dimensionsInches.height,
      yFromFloorInches: snappedY,
      maxWeightLbs: comp.maxWeightLbs,
      priceUsd: comp.priceUsd,
      requiresBracket: comp.requiresBracket,
    };

    onUpdatePlacedComponents([...placedComponents, newItem]);
  };

  const handleMoveComponent = (id: string, newYFromFloorInches: number) => {
    onUpdatePlacedComponents(
      placedComponents.map((c) =>
        c.id === id ? { ...c, yFromFloorInches: newYFromFloorInches } : c
      )
    );
  };

  const handleRemoveComponent = (id: string) => {
    onUpdatePlacedComponents(placedComponents.filter((c) => c.id !== id));
  };

  const componentsInActiveBay = placedComponents
    .filter((c) => c.bayIndex === (activeBay?.bayIndex ?? 0))
    .sort((a, b) => b.yFromFloorInches - a.yFromFloorInches);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            Step 6 of 8 • Interactive Shelf & Component Builder
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Customize {system.systemName} ({variation.title})
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Select a bay on the canvas, click any component on the left to add it, and drag shelves
            up or down (snaps every {formatLength(system.verticalSlotIntervalInches, unit)}).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={onAutoPopulateStarter}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Auto-Fill Starter Shelves
          </button>
          <button
            type="button"
            onClick={() => onUpdatePlacedComponents([])}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 text-xs font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All Shelves
          </button>
        </div>
      </div>

      {/* Bay Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pr-1">
          Target Bay:
        </span>
        {variation.bays.map((bay) => {
          const isSelected = activeBay?.bayIndex === bay.bayIndex;
          const count = placedComponents.filter((c) => c.bayIndex === bay.bayIndex).length;
          return (
            <button
              key={bay.bayIndex}
              type="button"
              onClick={() => setSelectedBayIndex(bay.bayIndex)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>
                Bay {bay.bayIndex + 1} ({formatLength(bay.widthInches, unit)} W)
              </span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-sky-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count} items
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split Builder: Component Palette (Left) + Interactive Canvas & Bay List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Compatible Component Palette */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Add to Bay {(activeBay?.bayIndex ?? 0) + 1} (
                {formatLength(activeBay?.widthInches || 0, unit)} W)
              </h3>
              <p className="text-[11px] text-slate-500">
                Matching brackets are added to your shopping list automatically.
              </p>
            </div>
          </div>

          {/* Role Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'shelf', label: 'Shelves' },
              { id: 'basket', label: 'Baskets' },
              { id: 'drawer', label: 'Drawers' },
              { id: 'rod', label: 'Rods' },
              { id: 'pegboard', label: 'Pegboards' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRoleFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  roleFilter === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Component Cards */}
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {compatibleComponents.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No {roleFilter !== 'all' ? roleFilter : ''} components available in this exact bay
                width ({formatLength(activeBay?.widthInches || 0, unit)}). Try selecting &ldquo;All&rdquo; or another bay.
              </div>
            ) : (
              compatibleComponents.map((comp) => (
                <div
                  key={comp.sku}
                  className="p-3 rounded-xl border border-slate-200 hover:border-sky-300 bg-slate-50/60 flex items-center justify-between gap-3 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                        {comp.role}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">SKU {comp.sku}</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 mt-1">{comp.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Depth: {formatLength(comp.dimensionsInches.depth, unit)} • Max{' '}
                      {comp.maxWeightLbs} lbs • <strong>${comp.priceUsd.toFixed(2)}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleAddComponentToBay(comp, activeBay?.bayIndex ?? 0)
                    }
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shrink-0 shadow-2xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Interactive Canvas + Precision Height List */}
        <div className="lg:col-span-8 space-y-4">
          <SpaceCanvas
            space={space}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            editableDimensions={false}
            skeleton={variation}
            placedComponents={placedComponents}
            selectedBayIndex={activeBay?.bayIndex ?? 0}
            onSelectBay={setSelectedBayIndex}
            interactivePlacement={true}
            slotIntervalInches={system.verticalSlotIntervalInches}
            onMoveComponent={handleMoveComponent}
            onRemoveComponent={handleRemoveComponent}
          />

          {/* Placed Components List in Selected Bay for Fine-Tuning */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-600" />
                Placed in Bay {(activeBay?.bayIndex ?? 0) + 1} ({componentsInActiveBay.length}{' '}
                components)
              </h4>
              <span className="text-[11px] text-slate-500">
                Drag vertically on canvas or adjust height below
              </span>
            </div>

            {componentsInActiveBay.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 italic">
                No shelves or components in Bay {(activeBay?.bayIndex ?? 0) + 1} yet. Click
                &ldquo;+ Add&rdquo; on any component on the left!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {componentsInActiveBay.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Height from floor:{' '}
                        <strong className="text-sky-700">
                          {formatLength(item.yFromFloorInches, unit)}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Move Down 1 Notch"
                        onClick={() =>
                          handleMoveComponent(
                            item.id,
                            Math.max(
                              (activeBay?.floorOffsetInches || 0) + 4,
                              item.yFromFloorInches - system.verticalSlotIntervalInches
                            )
                          )
                        }
                        className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        title="Move Up 1 Notch"
                        onClick={() =>
                          handleMoveComponent(
                            item.id,
                            Math.min(
                              (activeBay?.topTrackYInches || 80) - item.heightInches - 2,
                              item.yFromFloorInches + system.verticalSlotIntervalInches
                            )
                          )
                        }
                        className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          Back to Skeleton Variations
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-sm transition cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Generate Parts Shopping List ({placedComponents.length} Shelves/Items)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
