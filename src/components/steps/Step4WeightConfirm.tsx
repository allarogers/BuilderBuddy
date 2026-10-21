import React from 'react';
import {
  CustomInventoryItem,
  MountingPreference,
  SkillLevel,
  SpaceDimensions,
  WeightTier,
} from '../../types/builder';
import { estimateWeightRequirement, getMatchingSystems } from '../../utils/layoutEngine';
import {
  Scale,
  Hammer,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
} from 'lucide-react';

interface Step4WeightConfirmProps {
  space: SpaceDimensions;
  selectedCanonicalIds: string[];
  customItems: CustomInventoryItem[];
  confirmedWeightTier: WeightTier;
  onChangeWeightTier: (tier: WeightTier) => void;
  mountingPreference: MountingPreference;
  onChangeMountingPreference: (pref: MountingPreference) => void;
  skillPreference: SkillLevel;
  onChangeSkillPreference: (skill: SkillLevel) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4WeightConfirm: React.FC<Step4WeightConfirmProps> = ({
  space,
  selectedCanonicalIds,
  customItems,
  confirmedWeightTier,
  onChangeWeightTier,
  mountingPreference,
  onChangeMountingPreference,
  skillPreference,
  onChangeSkillPreference,
  onNext,
  onBack,
}) => {
  const analysis = estimateWeightRequirement(selectedCanonicalIds, customItems);
  const { matching } = getMatchingSystems(
    space,
    confirmedWeightTier,
    mountingPreference,
    selectedCanonicalIds
  );

  const WEIGHT_TIERS: {
    id: WeightTier;
    title: string;
    rangeLabel: string;
    bayLoad: string;
    examples: string;
  }[] = [
    {
      id: 'light',
      title: 'Light-to-Medium Load',
      rangeLabel: 'Up to 45–55 lbs per shelf',
      bayLoad: '~200 lbs per bay',
      examples: 'Folded clothes, towels, bedding, paper towels, light toys (e.g., IKEA BOAXEL)',
    },
    {
      id: 'medium',
      title: 'Medium Closet & Utility Load',
      rangeLabel: '55–75 lbs per shelf',
      bayLoad: '~300–350 lbs per bay',
      examples: 'Hanging coats, shoes, small bins, linen closets (e.g., Elfa Classic, IKEA PAX)',
    },
    {
      id: 'heavy',
      title: 'Heavy-Duty Pantry & Garage Load',
      rangeLabel: '80–280+ lbs per shelf',
      bayLoad: '500–800 lbs per bay',
      examples:
        'Canned goods, glass jars, small appliances, power tools, bulk totes (e.g., Elfa Décor+/Garage+, Rubbermaid FastTrack, IKEA BROR)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
          Step 4 of 8 • Weight Load & Mounting Confirmation
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Confirm Your Weight Capacity &amp; Mounting Needs
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Based on the items you selected in Step 3, here is the estimated weight load capacity
          needed for your space. Confirm or adjust it below.
        </p>
      </div>

      {/* Automated Recommendation Banner */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-300">
            <Scale className="w-4 h-4" />
            BuilderBuddy Load Analysis Result
          </div>
          <h2 className="text-xl font-extrabold">
            Recommended Load Capacity:{' '}
            <span className="text-sky-400 uppercase">{analysis.recommendedTier} Tier</span> (~
            {analysis.estimatedMaxShelfLbs} lbs/shelf • ~{analysis.estimatedBayLbs} lbs/bay)
          </h2>
          {analysis.heavyItemsTriggered.length > 0 ? (
            <p className="text-xs text-slate-300">
              Triggered by heavy storage selections:{' '}
              <strong className="text-white">
                {analysis.heavyItemsTriggered.slice(0, 5).join(', ')}
              </strong>
            </p>
          ) : (
            <p className="text-xs text-slate-300">
              Based on your selected items, standard light-to-medium shelving is sufficient, or you
              can upgrade to Heavy-Duty for extra safety margin.
            </p>
          )}
        </div>

        {confirmedWeightTier !== analysis.recommendedTier && (
          <button
            type="button"
            onClick={() => onChangeWeightTier(analysis.recommendedTier)}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold shrink-0 transition"
          >
            Use Recommended ({analysis.recommendedTier.toUpperCase()})
          </button>
        )}
      </div>

      {/* 1. Confirm Weight Load Tier */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-600" />
          1. Confirm Target Weight Load Capacity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {WEIGHT_TIERS.map((tier) => {
            const isSelected = confirmedWeightTier === tier.id;
            const isRecommended = analysis.recommendedTier === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onChangeWeightTier(tier.id)}
                className={`text-left p-4 rounded-2xl border transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50/90 border-sky-600 ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-extrabold text-slate-900">{tier.title}</span>
                    {isRecommended && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-sky-700">{tier.rangeLabel}</div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    {tier.bayLoad}
                  </div>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{tier.examples}</p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-200/80 flex items-center gap-1.5 text-xs font-bold text-sky-700">
                  <CheckCircle2
                    className={`w-4 h-4 ${isSelected ? 'text-sky-600' : 'text-slate-300'}`}
                  />
                  {isSelected ? 'Confirmed Weight Tier' : 'Click to Select'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Mounting & DIY Skill Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Hammer className="w-4 h-4 text-sky-600" />
            2. Mounting Style Preference
          </h3>
          <p className="text-xs text-slate-500">
            Off-the-floor hanging track systems keep floor space clear (ideal for crawl-space access
            or narrow pantries) and mount using drywall anchors without needing stud alignment.
          </p>
          <div className="space-y-2">
            {(
              [
                {
                  id: 'any',
                  label: 'Show All Compatible Systems (Wall-Hung & Freestanding)',
                },
                {
                  id: 'top-track-hanging',
                  label: 'Off-the-Floor Wall-Mounted Only (Elfa, BOAXEL, FastTrack)',
                },
                {
                  id: 'freestanding-frame',
                  label: 'Floor-Standing Frames Only (IKEA BROR, IKEA PAX)',
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeMountingPreference(opt.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition ${
                  mountingPreference === opt.id
                    ? 'bg-sky-50 border-sky-600 text-sky-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900">
              3. DIY Installation Comfort &amp; Matching Catalog Summary
            </h3>
            <p className="text-xs text-slate-500">
              All wall-mounted systems in BuilderBuddy support heavy-duty hollow-wall / drywall
              anchors—no sawing or stud-hunting required.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onChangeSkillPreference('intermediate')}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold ${
                  skillPreference === 'intermediate'
                    ? 'bg-sky-50 border-sky-600 text-sky-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>Measure, Level &amp; Drill</div>
                <div className="text-[10px] font-normal text-slate-500">
                  Wall tracks + drywall anchors
                </div>
              </button>
              <button
                type="button"
                onClick={() => onChangeSkillPreference('beginner')}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold ${
                  skillPreference === 'beginner'
                    ? 'bg-sky-50 border-sky-600 text-sky-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>Minimal Drilling / Assembly</div>
                <div className="text-[10px] font-normal text-slate-500">
                  Freestanding or simple kits
                </div>
              </button>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              matching.length > 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {matching.length > 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div className="text-xs">
              <strong>{matching.length} Storage System(s)</strong> match your wall measurements and
              confirmed <strong>{confirmedWeightTier.toUpperCase()}</strong> weight load.
            </div>
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
          Back to Inventory
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-sm transition cursor-pointer"
        >
          <span>Confirm Load &amp; View System Variations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
