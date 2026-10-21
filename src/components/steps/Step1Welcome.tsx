import React from 'react';
import {
  Ruler,
  PackageCheck,
  Weight,
  LayoutGrid,
  Printer,
  ArrowRight,
  Sliders,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface Step1WelcomeProps {
  onStartBuilding: () => void;
  onLoadPresetDemo: (preset: 'pantry-sloped' | 'garage-stepped' | 'closet-standard') => void;
}

export const Step1Welcome: React.FC<Step1WelcomeProps> = ({
  onStartBuilding,
  onLoadPresetDemo,
}) => {
  return (
    <div className="space-y-8 py-4">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white p-8 sm:p-12 shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Home Storage & Organization Engineering Assistant
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Optimize Any Wall, Closet, Pantry, or Garage with{' '}
            <span className="text-sky-400">BuilderBuddy</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
            Every space is different—from slanted under-stairs "Harry Potter" pantries to stepped
            garage curbs. BuilderBuddy matches your exact measurements, inventory weight loads, and
            mounting preferences against real modular systems from{' '}
            <strong className="text-white">
              The Container Store (Elfa Classic, Décor+ & Garage+), IKEA (BOAXEL, PAX, BROR),
              Lowe&apos;s, and Home Depot
            </strong>
            .
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartBuilding}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-base shadow-lg shadow-sky-500/25 transition transform active:scale-98 cursor-pointer"
            >
              <span>Start Building</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pl-1">
              <span>Or try a quick real-world preset:</span>
              <button
                type="button"
                onClick={() => onLoadPresetDemo('pantry-sloped')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
              >
                📐 Sloped Under-Stairs Pantry
              </button>
              <button
                type="button"
                onClick={() => onLoadPresetDemo('garage-stepped')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
              >
                🪜 Stepped Garage Wall
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Grid */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">
          How BuilderBuddy Takes You From Tape Measure to Shopping List
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              1. Draw Standard or Irregular Spaces
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Toggle between Side/Elevation View and Top/Plan View in inches or cm. Easily model
              sloped ceilings (under stairs) and raised floor steps with automatic proportional
              scaling.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              2. Select What You&apos;re Storing
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse our alphabetical multi-level category tree with live search, cross-category
              syncing, and custom &ldquo;Other&rdquo; items to calculate real shelf weight loads.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Weight className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              3. Confirm Weight Load & Mounting
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review your calculated weight capacity requirements and filter between wall-hung top
              track systems (using heavy-duty drywall anchors—no stud-alignment headaches) or
              freestanding frames.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              4. Compare Up to 5 Skeleton Variations
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore candidate brands and preview up to 5 structural frame arrangements per system
              (Balanced Coverage, Wider Bays, High Load Density, Slope Hugging, and Symmetrical).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              5. Interactive Shelf, Drawer & Rod Placement
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add and drag shelves, mesh baskets, drawers, clothes rods, and pegboards along real
              upright notch intervals with live vertical clearance readouts.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              6. SKU Shopping List & 8.5&quot;×11&quot; Print Blueprint
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automatically includes required brackets and anchors, generating a printable portrait
              blueprint diagram, full SKU table, and store directory.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Retail Systems Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Built-in Multi-Brand Catalog + BuilderMiner Compatible
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Includes Elfa Classic, interchangeable Elfa Décor+ &amp; Garage+, IKEA BOAXEL, IKEA
              PAX, IKEA BROR, Rubbermaid FastTrack, and ClosetMaid Pro. All sessions and design
              branches save locally in your browser.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onStartBuilding}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition"
        >
          Measure My Space →
        </button>
      </div>
    </div>
  );
};
