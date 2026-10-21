import React, { useState, useEffect } from 'react';
import {
  CatalogSystem,
  MountingPreference,
  SkeletonVariation,
  SpaceDimensions,
  WeightTier,
} from '../../types/builder';
import { generateSkeletonVariations, getMatchingSystems } from '../../utils/layoutEngine';
import { SpaceCanvas } from '../canvas/SpaceCanvas';
import { formatLength } from '../../utils/units';
import {
  CheckCircle2,
  Layers,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Store,
  Info,
} from 'lucide-react';

interface Step5SkeletonVariationsProps {
  space: SpaceDimensions;
  confirmedWeightTier: WeightTier;
  mountingPreference: MountingPreference;
  selectedCanonicalIds: string[];
  selectedSystemId: string | null;
  selectedVariationId: string | null;
  onSelectSystemAndVariation: (system: CatalogSystem, variation: SkeletonVariation) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step5SkeletonVariations: React.FC<Step5SkeletonVariationsProps> = ({
  space,
  confirmedWeightTier,
  mountingPreference,
  selectedCanonicalIds,
  selectedSystemId,
  selectedVariationId,
  onSelectSystemAndVariation,
  onNext,
  onBack,
}) => {
  const [viewMode, setViewMode] = useState<'elevation' | 'top'>('elevation');

  const { matching, allWithStatus } = getMatchingSystems(
    space,
    confirmedWeightTier,
    mountingPreference,
    selectedCanonicalIds
  );

  const candidateSystems = matching.length > 0 ? matching : allWithStatus.map((x) => x.system);
  const activeSystem =
    candidateSystems.find((s) => s.systemId === selectedSystemId) || candidateSystems[0];

  const variations = activeSystem ? generateSkeletonVariations(activeSystem, space) : [];
  const activeVariation =
    variations.find((v) => v.variationId === selectedVariationId) || variations[0] || null;

  useEffect(() => {
    if (
      activeSystem &&
      activeVariation &&
      (selectedSystemId !== activeSystem.systemId ||
        selectedVariationId !== activeVariation.variationId)
    ) {
      onSelectSystemAndVariation(activeSystem, activeVariation);
    }
  }, [activeSystem?.systemId, activeVariation?.variationId]);

  const unit = space.unit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
          Step 5 of 8 • Candidate Systems & Structural Skeleton Variations
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Select a Storage Brand &amp; Frame Layout Variation
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Explore matching retail storage systems below. For each brand, review up to{' '}
          <strong>5 structural skeleton variations</strong> (top tracks and vertical standards
          aligned to your wall) before placing shelves in Step 6.
        </p>
      </div>

      {/* 1. Candidate Brand / System Selector Cards */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
          1. Matching Retail Storage Systems ({candidateSystems.length})
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {candidateSystems.map((sys) => {
            const isSelected = activeSystem?.systemId === sys.systemId;
            return (
              <button
                key={sys.systemId}
                type="button"
                onClick={() => {
                  const vars = generateSkeletonVariations(sys, space);
                  if (vars.length > 0) {
                    onSelectSystemAndVariation(sys, vars[0]);
                  }
                }}
                className={`text-left p-4 rounded-2xl border transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/90 border-sky-600 ring-2 ring-sky-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      {sys.brand}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Up to {sys.maxShelfLoadLbs} lbs/shelf
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    {sys.systemName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sys.description}</p>

                  {sys.compatibleLines.length > 1 && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                      ✓ Interchangeable: {sys.compatibleLines.join(' + ')}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>
                    Bays: {sys.standardBayWidthsInches.map((w) => formatLength(w, unit)).join(', ')}
                  </span>
                  <span className={isSelected ? 'text-sky-700 font-bold' : ''}>
                    {isSelected ? '● Active Brand' : 'Preview →'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Up to 5 Design Variations + Live Wall Skeleton Preview */}
      {activeSystem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: 5 Skeleton Variations List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                2. {activeSystem.systemName} — {variations.length} Frame Variations
              </span>
            </div>

            {variations.map((v) => {
              const isSelected = activeVariation?.variationId === v.variationId;
              return (
                <button
                  key={v.variationId}
                  type="button"
                  onClick={() => onSelectSystemAndVariation(activeSystem, v)}
                  className={`w-full text-left p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      Variation {v.variationNumber} • {v.optimizationBadge}
                    </span>
                    <span
                      className={`text-xs font-extrabold ${
                        isSelected ? 'text-sky-100' : 'text-slate-700'
                      }`}
                    >
                      Frame: ${v.skeletonCostUsd.toFixed(2)}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold mt-1.5">{v.title}</h4>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isSelected ? 'text-sky-100' : 'text-slate-600'
                    }`}
                  >
                    {v.description}
                  </p>

                  <div
                    className={`mt-3 pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold ${
                      isSelected
                        ? 'border-sky-500 text-white'
                        : 'border-slate-100 text-slate-600'
                    }`}
                  >
                    <span>
                      {v.bays.length} Bay(s):{' '}
                      {v.bays.map((b) => formatLength(b.widthInches, unit)).join(' + ')}
                    </span>
                    <span>
                      {v.uprights.length} Uprights • {v.coveragePercent}% Wall Width
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Scaled Skeleton Visualization on the Wall Canvas */}
          <div className="lg:col-span-7 space-y-4">
            <SpaceCanvas
              space={space}
              viewMode={viewMode}
              onToggleViewMode={setViewMode}
              editableDimensions={false}
              skeleton={activeVariation}
              placedComponents={[]}
              slotIntervalInches={activeSystem.verticalSlotIntervalInches}
            />

            {activeVariation && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-900">Skeleton Hardware Summary:</strong>{' '}
                    {activeVariation.uprights.length} vertical standards (
                    {activeVariation.uprights
                      .map((u) => formatLength(u.heightInches, unit))
                      .join(', ')}
                    ) spanning{' '}
                    <strong>{formatLength(activeVariation.totalCoveredWidthInches, unit)}</strong>{' '}
                    of your {formatLength(space.widthInches, unit)} wall.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Weight Confirmation
        </button>

        <button
          type="button"
          disabled={!activeSystem || !activeVariation}
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-sm font-bold shadow-sm transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Pick Variation {activeVariation?.variationNumber} &amp; Place Shelves</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
