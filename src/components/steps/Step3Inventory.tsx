import React, { useState, useMemo } from 'react';
import { CustomInventoryItem, InventoryNode, WeightTier } from '../../types/builder';
import { INVENTORY_CATEGORIES } from '../../data/categories';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Link2,
  CheckSquare,
  Square,
} from 'lucide-react';

interface Step3InventoryProps {
  selectedCanonicalIds: string[];
  onToggleCanonicalIds: (canonicalIds: string[], select: boolean) => void;
  customItems: CustomInventoryItem[];
  onAddCustomItem: (item: CustomInventoryItem) => void;
  onRemoveCustomItem: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Inventory: React.FC<Step3InventoryProps> = ({
  selectedCanonicalIds,
  onToggleCanonicalIds,
  customItems,
  onAddCustomItem,
  onRemoveCustomItem,
  onNext,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    INVENTORY_CATEGORIES.forEach((c) => {
      init[c.id] = true;
    });
    return init;
  });

  const [customName, setCustomName] = useState('');
  const [customTier, setCustomTier] = useState<WeightTier>('medium');

  // Filter & highlight tree based on search query
  const filteredTree = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return INVENTORY_CATEGORIES;

    const filterNodes = (nodes: InventoryNode[]): InventoryNode[] => {
      const result: InventoryNode[] = [];
      for (const node of nodes) {
        const selfMatches = node.name.toLowerCase().includes(q);
        const childMatches = node.children ? filterNodes(node.children) : [];
        if (selfMatches || childMatches.length > 0) {
          result.push({
            ...node,
            children: selfMatches && childMatches.length === 0 ? node.children : childMatches,
          });
        }
      }
      return result;
    };

    return filterNodes(INVENTORY_CATEGORIES);
  }, [searchQuery]);

  const collectSelfAndDescendantCanonicalIds = (node: InventoryNode): string[] => {
    const ids = [node.canonicalId];
    if (node.children) {
      for (const child of node.children) {
        ids.push(...collectSelfAndDescendantCanonicalIds(child));
      }
    }
    return Array.from(new Set(ids));
  };

  const handleNodeToggle = (node: InventoryNode) => {
    const allIds = collectSelfAndDescendantCanonicalIds(node);
    const isCurrentlyChecked = selectedCanonicalIds.includes(node.canonicalId);
    onToggleCanonicalIds(allIds, !isCurrentlyChecked);
  };

  const handleAddOther = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddCustomItem({
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      weightTier: customTier,
    });
    setCustomName('');
  };

  const renderTreeNode = (node: InventoryNode, depth = 0) => {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = searchQuery.trim().length > 0 || (expandedIds[node.id] ?? depth === 0);
    const isChecked = selectedCanonicalIds.includes(node.canonicalId);
    const isShared = node.name.toLowerCase().includes('shared');

    const tierBadge =
      node.weightTier === 'heavy'
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : node.weightTier === 'medium'
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

    return (
      <div key={node.id} className={depth > 0 ? 'ml-5 border-l border-slate-200 pl-3 mt-1.5' : ''}>
        <div
          className={`flex items-center justify-between gap-2 p-2 rounded-xl transition ${
            isChecked ? 'bg-sky-50/90 border border-sky-200' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() =>
                  setExpandedIds((prev) => ({ ...prev, [node.id]: !isExpanded }))
                }
                className="p-0.5 rounded hover:bg-slate-200 text-slate-500"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}

            <button
              type="button"
              onClick={() => handleNodeToggle(node)}
              className="flex items-center gap-2.5 text-left flex-1 min-w-0 cursor-pointer"
            >
              {isChecked ? (
                <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span
                className={`text-xs sm:text-sm ${
                  depth === 0 ? 'font-extrabold text-slate-900' : 'font-semibold text-slate-800'
                }`}
              >
                {node.name}
              </span>
              {isShared && (
                <span
                  title="Selecting this syncs automatically across all categories where it appears"
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold shrink-0"
                >
                  <Link2 className="w-3 h-3" />
                  Synced
                </span>
              )}
            </button>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${tierBadge}`}
          >
            ~{node.weightLbsPerShelf} lbs/shelf ({node.weightTier})
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            Step 3 of 8 • Inventory & Storage Needs
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            What Stuff Will This Space Store?
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Expand categories to check all items you plan to store. Shared subcategories sync
            automatically across branches.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => {
              const allOpen: Record<string, boolean> = {};
              INVENTORY_CATEGORIES.forEach((c) => {
                allOpen[c.id] = true;
                c.children?.forEach((sub) => (allOpen[sub.id] = true));
              });
              setExpandedIds(allOpen);
            }}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={() => setExpandedIds({})}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Search & Summary Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories or items (e.g., 'Canned', 'Power Tools', 'Bedding', 'Car')..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-2xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Alphabetical Category Tree */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs divide-y divide-slate-100 space-y-3">
            {filteredTree.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No categories matched &ldquo;{searchQuery}&rdquo;. Add it as a custom
                &ldquo;Other&rdquo; item on the right!
              </div>
            ) : (
              filteredTree.map((cat) => (
                <div key={cat.id} className="pt-2 first:pt-0">
                  {renderTreeNode(cat, 0)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Custom "Other" Item Builder + Active Selection Count */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Don&apos;t See Your Item? Add &ldquo;Other&rdquo;
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add custom items and pick one of the 3 weight categories so BuilderBuddy calculates
                your shelf load accurately.
              </p>
            </div>

            <form onSubmit={handleAddOther} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Cast Iron Dutch Ovens, Ski Boots"
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Weight Category (Pick 1 of 3)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'light', label: 'Light', sub: '< 15 lbs' },
                      { id: 'medium', label: 'Medium', sub: '15–40 lbs' },
                      { id: 'heavy', label: 'Heavy', sub: '40+ lbs' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCustomTier(opt.id)}
                      className={`p-2 rounded-xl border text-center transition ${
                        customTier === opt.id
                          ? 'bg-sky-50 border-sky-600 text-sky-900 ring-1 ring-sky-600'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{opt.label}</div>
                      <div className="text-[10px] text-slate-500">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Custom Item
              </button>
            </form>

            {customItems.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  Custom Items Added ({customItems.length})
                </div>
                {customItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                        {item.weightTier}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveCustomItem(item.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selection Counter Card */}
          <div className="bg-sky-50/80 rounded-2xl border border-sky-200 p-4 space-y-1.5">
            <div className="text-xs font-extrabold text-sky-950">
              {selectedCanonicalIds.length} Category Node(s) + {customItems.length} Custom Item(s)
              Selected
            </div>
            <p className="text-[11px] text-sky-800 leading-relaxed">
              In Step 4, BuilderBuddy will analyze these selections to determine your required
              shelf weight load capacity and compatible mounting systems.
            </p>
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
          Back to Space Measurements
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-sm transition cursor-pointer"
        >
          <span>Next: Calculate Weight Load</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
