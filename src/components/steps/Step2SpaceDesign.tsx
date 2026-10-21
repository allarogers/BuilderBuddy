import React, { useState } from 'react';
import { SpaceDimensions, SpaceTemplateId } from '../../types/builder';
import { SpaceCanvas } from '../canvas/SpaceCanvas';
import { inchesToUnit, unitToInches } from '../../utils/units';
import {
  Square,
  TriangleRight,
  CornerRightDown,
  PenTool,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface Step2SpaceDesignProps {
  space: SpaceDimensions;
  onUpdateSpace: (updated: Partial<SpaceDimensions>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TEMPLATES: {
  id: SpaceTemplateId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  preset: Partial<SpaceDimensions>;
}[] = [
  {
    id: 'standard',
    title: 'Standard Flat Wall',
    subtitle: 'Rectangular floor-to-ceiling closet, pantry, or garage wall (96" W × 84" H)',
    icon: <Square className="w-5 h-5 text-sky-600" />,
    preset: {
      templateId: 'standard',
      widthInches: 96,
      leftHeightInches: 84,
      rightHeightInches: 84,
      depthInches: 24,
      hasSlopedCeiling: false,
      hasFloorStep: false,
    },
  },
  {
    id: 'sloped',
    title: 'Sloped Ceiling / Under-Stairs',
    subtitle: 'Angled roof line with independent left and right ceiling heights',
    icon: <TriangleRight className="w-5 h-5 text-amber-600" />,
    preset: {
      templateId: 'sloped',
      widthInches: 78,
      leftHeightInches: 92,
      rightHeightInches: 48,
      depthInches: 20,
      hasSlopedCeiling: true,
      hasFloorStep: false,
    },
  },
  {
    id: 'stepped',
    title: 'Stepped Floor / Foundation Curb',
    subtitle: 'Wall with a raised concrete garage curb, step, or crawl-space ledge',
    icon: <CornerRightDown className="w-5 h-5 text-emerald-600" />,
    preset: {
      templateId: 'stepped',
      widthInches: 108,
      leftHeightInches: 96,
      rightHeightInches: 96,
      depthInches: 24,
      hasSlopedCeiling: false,
      hasFloorStep: true,
      stepSide: 'right',
      stepWidthInches: 28,
      stepHeightInches: 10,
    },
  },
  {
    id: 'scratch',
    title: 'Start from Scratch',
    subtitle: 'Custom dimensions with full control over slopes and floor steps',
    icon: <PenTool className="w-5 h-5 text-indigo-600" />,
    preset: {
      templateId: 'scratch',
      widthInches: 72,
      leftHeightInches: 80,
      rightHeightInches: 80,
      depthInches: 18,
      hasSlopedCeiling: false,
      hasFloorStep: false,
    },
  },
];

export const Step2SpaceDesign: React.FC<Step2SpaceDesignProps> = ({
  space,
  onUpdateSpace,
  onNext,
  onBack,
}) => {
  const [viewMode, setViewMode] = useState<'elevation' | 'top'>('elevation');
  const unit = space.unit;

  const handleNumberInput = (field: keyof SpaceDimensions, rawVal: string) => {
    const num = parseFloat(rawVal);
    if (isNaN(num) || num <= 0) return;
    const inches = unitToInches(num, unit);

    if (field === 'leftHeightInches' && !space.hasSlopedCeiling) {
      onUpdateSpace({ leftHeightInches: inches, rightHeightInches: inches });
    } else {
      onUpdateSpace({ [field]: inches });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            Step 2 of 8 • Space Geometry
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Define Your Wall &amp; Space Measurements
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Pick a starting template or customize directly. Tap any measurement on the drawing or
            use the controls on the left.
          </p>
        </div>

        {/* Unit Selector Pill */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs self-start">
          <span className="text-xs font-bold text-slate-700">Measurement Unit:</span>
          <button
            type="button"
            onClick={() => onUpdateSpace({ unit: 'in' })}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              unit === 'in'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Inches (in)
          </button>
          <button
            type="button"
            onClick={() => onUpdateSpace({ unit: 'cm' })}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              unit === 'cm'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Centimeters (cm)
          </button>
        </div>
      </div>

      {/* 4 Space Initialization Template Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TEMPLATES.map((tpl) => {
          const isSelected = space.templateId === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onUpdateSpace(tpl.preset)}
              className={`text-left p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-sky-50/90 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0">
                {tpl.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-slate-900">{tpl.title}</div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tpl.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split Interface: Parametric Controls (Left) + Auto-Scaled Interactive Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Wall Reference Name
            </label>
            <input
              type="text"
              value={space.wallName}
              onChange={(e) => onUpdateSpace({ wallName: e.target.value })}
              placeholder="e.g., Pantry Wall A, Garage North Wall"
              className="w-full px-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Wall Width ({unit})
              </label>
              <input
                type="number"
                step="0.5"
                value={inchesToUnit(space.widthInches, unit)}
                onChange={(e) => handleNumberInput('widthInches', e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Room Depth ({unit})
              </label>
              <input
                type="number"
                step="0.5"
                value={inchesToUnit(space.depthInches, unit)}
                onChange={(e) => handleNumberInput('depthInches', e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Ceiling Geometry Modifier */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Ceiling Profile
              </span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSpace({
                      hasSlopedCeiling: false,
                      rightHeightInches: space.leftHeightInches,
                    })
                  }
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                    !space.hasSlopedCeiling
                      ? 'bg-white text-sky-700 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  Flat
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSpace({
                      hasSlopedCeiling: true,
                      rightHeightInches:
                        space.rightHeightInches === space.leftHeightInches
                          ? Math.max(36, Math.round(space.leftHeightInches * 0.6))
                          : space.rightHeightInches,
                    })
                  }
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                    space.hasSlopedCeiling
                      ? 'bg-white text-sky-700 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  Sloped (Under-Stairs)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {space.hasSlopedCeiling ? `Left Height (${unit})` : `Wall Height (${unit})`}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={inchesToUnit(space.leftHeightInches, unit)}
                  onChange={(e) => handleNumberInput('leftHeightInches', e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {space.hasSlopedCeiling && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Right Height ({unit})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inchesToUnit(space.rightHeightInches, unit)}
                    onChange={(e) => handleNumberInput('rightHeightInches', e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Floor Geometry Modifier */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Floor Step / Curb
              </span>
              <button
                type="button"
                onClick={() => onUpdateSpace({ hasFloorStep: !space.hasFloorStep })}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                  space.hasFloorStep
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {space.hasFloorStep ? '✓ Floor Step Active' : '+ Add Floor Step'}
              </button>
            </div>

            {space.hasFloorStep && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Step Side:</span>
                  <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => onUpdateSpace({ stepSide: 'left' })}
                      className={`px-2.5 py-0.5 text-xs font-bold rounded ${
                        space.stepSide === 'left' ? 'bg-sky-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Left Side
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateSpace({ stepSide: 'right' })}
                      className={`px-2.5 py-0.5 text-xs font-bold rounded ${
                        space.stepSide === 'right' ? 'bg-sky-600 text-white' : 'text-slate-600'
                      }`}
                    >
                      Right Side
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Step Width ({unit})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={inchesToUnit(space.stepWidthInches, unit)}
                      onChange={(e) => handleNumberInput('stepWidthInches', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Step Height ({unit})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={inchesToUnit(space.stepHeightInches, unit)}
                      onChange={(e) => handleNumberInput('stepHeightInches', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Canvas Panel */}
        <div className="lg:col-span-8">
          <SpaceCanvas
            space={space}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            onChangeSpace={onUpdateSpace}
            editableDimensions={true}
          />
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
          Back to Welcome
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-sm transition cursor-pointer"
        >
          <span>Next: Select Stuff to Store</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
