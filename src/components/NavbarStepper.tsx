import React from 'react';
import { MeasurementUnit } from '../types/builder';
import { FolderKanban, Hammer, Check } from 'lucide-react';

interface NavbarStepperProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  unit: MeasurementUnit;
  onToggleUnit: (unit: MeasurementUnit) => void;
  savedDesignsCount: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeSaveName: string | null;
}

const STEPS = [
  { num: 1, label: 'Welcome' },
  { num: 2, label: 'Space & Wall' },
  { num: 3, label: 'Stuff to Store' },
  { num: 4, label: 'Weight & Mount' },
  { num: 5, label: 'System & Frame' },
  { num: 6, label: 'Shelf Builder' },
  { num: 7, label: 'Shopping List' },
  { num: 8, label: 'Print Plan' },
];

export const NavbarStepper: React.FC<NavbarStepperProps> = ({
  currentStep,
  onSelectStep,
  unit,
  onToggleUnit,
  savedDesignsCount,
  isSidebarOpen,
  onToggleSidebar,
  activeSaveName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 print:hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        {/* Top Row: Logo, Active Project Badge, Unit Toggle & My Designs Button */}
        <div className="flex items-center justify-between h-14 gap-3">
          <div
            onClick={() => onSelectStep(1)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-sm group-hover:bg-sky-700 transition">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  BuilderBuddy
                </span>
                <span className="hidden md:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  Smart Storage Planner
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {activeSaveName && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Editing: <strong className="text-slate-900">{activeSaveName}</strong>
              </div>
            )}

            {/* Unit Switcher (in <-> cm) */}
            <div className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => onToggleUnit('in')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  unit === 'in'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => onToggleUnit('cm')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                  unit === 'cm'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                cm
              </button>
            </div>

            {/* My Designs Sidebar Button */}
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                isSidebarOpen
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>My Designs</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                  isSidebarOpen ? 'bg-sky-800 text-white' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {savedDesignsCount}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Non-Linear Stepper */}
        <nav
          aria-label="Design Progress"
          className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar border-t border-slate-100"
        >
          {STEPS.map((s) => {
            const isCurrent = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => onSelectStep(s.num)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isCurrent
                    ? 'bg-sky-600 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isCurrent
                      ? 'bg-white text-sky-700'
                      : isCompleted
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : s.num}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
