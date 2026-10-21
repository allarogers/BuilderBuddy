import React, { useState } from 'react';
import { DesignFolder, SavedDesign } from '../types/builder';
import {
  FolderPlus,
  Folder,
  Save,
  GitBranch,
  Trash2,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { formatLength } from '../utils/units';

interface MyDesignsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  folders: DesignFolder[];
  savedDesigns: SavedDesign[];
  activeSaveId: string | null;
  currentWallName: string;
  onCreateFolder: (folderName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onSaveNewDesign: (name: string, folderId: string) => void;
  onOverwriteDesign: (saveId: string) => void;
  onLoadDesign: (design: SavedDesign) => void;
  onDeleteDesign: (saveId: string) => void;
}

export const MyDesignsSidebar: React.FC<MyDesignsSidebarProps> = ({
  isOpen,
  onClose,
  folders,
  savedDesigns,
  activeSaveId,
  currentWallName,
  onCreateFolder,
  onDeleteFolder,
  onSaveNewDesign,
  onOverwriteDesign,
  onLoadDesign,
  onDeleteDesign,
}) => {
  const [newDesignName, setNewDesignName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    folders[0]?.id || 'folder-pantry'
  );
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'folder-pantry': true,
    'folder-garage': true,
    'folder-closet': true,
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSaveAsNew = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName =
      newDesignName.trim() || `${currentWallName || 'Wall Design'} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    const targetFolder = selectedFolderId || folders[0]?.id || 'folder-default';
    onSaveNewDesign(finalName, targetFolder);
    setNewDesignName('');
    setExpandedFolders((prev) => ({ ...prev, [targetFolder]: true }));
    triggerToast(`Saved "${finalName}"`);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolderInput(false);
    triggerToast(`Created folder "${newFolderName.trim()}"`);
  };

  const activeDesign = savedDesigns.find((d) => d.id === activeSaveId);

  return (
    <aside className="w-full sm:w-80 md:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 shadow-xl sm:shadow-none z-30 print:hidden">
      {/* Header */}
      <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-wide flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-sky-400" />
            My Designs & Room Folders
          </h2>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Save snapshots, branch variations, or group by room
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {toastMsg && (
        <div className="mx-4 mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
          <Check className="w-4 h-4 text-emerald-600" />
          {toastMsg}
        </div>
      )}

      {/* Save Current State Section */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        {activeDesign && (
          <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                Active Save
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">{activeDesign.name}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                onOverwriteDesign(activeDesign.id);
                triggerToast(`Updated "${activeDesign.name}"`);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shrink-0 transition"
            >
              <Save className="w-3.5 h-3.5" />
              Overwrite Save
            </button>
          </div>
        )}

        <form onSubmit={handleSaveAsNew} className="space-y-2.5">
          <div className="text-xs font-bold text-slate-700">
            Save Current Progress as New Design / Branch
          </div>
          <input
            type="text"
            value={newDesignName}
            onChange={(e) => setNewDesignName(e.target.value)}
            placeholder={`e.g., ${currentWallName || 'Pantry Wall A'} - V2`}
            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <div className="flex items-center gap-2">
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shrink-0 transition"
            >
              <GitBranch className="w-3.5 h-3.5" />
              Save New
            </button>
          </div>
        </form>
      </div>

      {/* Folders Header */}
      <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-white">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Room Folders ({folders.length})
        </span>
        <button
          type="button"
          onClick={() => setShowNewFolderInput(!showNewFolderInput)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          New Folder
        </button>
      </div>

      {showNewFolderInput && (
        <form
          onSubmit={handleCreateFolder}
          className="p-3 bg-sky-50/60 border-b border-sky-100 flex items-center gap-2"
        >
          <input
            type="text"
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Room name (e.g., Laundry Room)"
            className="flex-1 px-2.5 py-1 text-xs border border-sky-300 rounded-lg bg-white"
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-sky-600 text-white text-xs font-bold rounded-lg"
          >
            Add
          </button>
        </form>
      )}

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {folders.map((folder) => {
          const designsInFolder = savedDesigns.filter((d) => d.folderId === folder.id);
          const isExpanded = expandedFolders[folder.id] ?? true;

          return (
            <div
              key={folder.id}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white"
            >
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedFolders((prev) => ({ ...prev, [folder.id]: !isExpanded }))
                  }
                  className="flex items-center gap-2 text-xs font-bold text-slate-800 flex-1 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <Folder className="w-4 h-4 text-amber-500 fill-amber-100" />
                  <span className="truncate">{folder.name}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full">
                    {designsInFolder.length}
                  </span>
                </button>
                {folders.length > 1 && designsInFolder.length === 0 && (
                  <button
                    type="button"
                    onClick={() => onDeleteFolder(folder.id)}
                    title="Delete empty folder"
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {designsInFolder.length === 0 ? (
                    <div className="px-3 py-3 text-[11px] text-slate-400 italic">
                      No saved designs in this folder yet.
                    </div>
                  ) : (
                    designsInFolder.map((design) => {
                      const isActive = design.id === activeSaveId;
                      const sp = design.state.space;
                      return (
                        <div
                          key={design.id}
                          className={`p-2.5 transition ${
                            isActive ? 'bg-sky-50/80' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => onLoadDesign(design)}
                              className="text-left flex-1 min-w-0"
                            >
                              <div className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {design.name}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {sp.wallName} • {formatLength(sp.widthInches, sp.unit)} W ×{' '}
                                {formatLength(sp.leftHeightInches, sp.unit)} H • Step{' '}
                                {design.state.currentStep}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Updated {design.updatedAt}
                              </div>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onOverwriteDesign(design.id);
                                  triggerToast(`Saved over "${design.name}"`);
                                }}
                                title="Save current progress over this design"
                                className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteDesign(design.id)}
                                title="Delete saved design"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
