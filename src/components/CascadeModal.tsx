import React, { useState } from 'react';
import { AlertTriangle, GitBranch, RefreshCw, ArrowLeft } from 'lucide-react';

interface CascadeModalProps {
  isOpen: boolean;
  onSaveBranchAndProceed: (branchName: string) => void;
  onOverwriteAndProceed: () => void;
  onCancelAndReturn: () => void;
  defaultBranchName: string;
}

export const CascadeModal: React.FC<CascadeModalProps> = ({
  isOpen,
  onSaveBranchAndProceed,
  onOverwriteAndProceed,
  onCancelAndReturn,
  defaultBranchName,
}) => {
  const [branchName, setBranchName] = useState(defaultBranchName);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Upstream Parameter Change Detected
            </h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Changing these parameters will reset or reflow your downstream layout. Would you like
              to save your current progress as a new design branch first, overwrite, or cancel and
              return to your previous step?
            </p>
          </div>
        </div>

        <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            New Branch Name (if saving a branch)
          </label>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="e.g., Pantry Wall A - Before Resize"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          />
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancelAndReturn}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel & Return
          </button>

          <button
            type="button"
            onClick={onOverwriteAndProceed}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            Overwrite & Reflow
          </button>

          <button
            type="button"
            onClick={() =>
              onSaveBranchAndProceed(branchName.trim() || defaultBranchName || 'Saved Branch')
            }
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition"
          >
            <GitBranch className="w-4 h-4" />
            Save as New Branch First
          </button>
        </div>
      </div>
    </div>
  );
};
