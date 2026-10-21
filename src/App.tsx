import React, { useState, useEffect } from 'react';
import {
  CatalogSystem,
  CustomInventoryItem,
  DesignFolder,
  MeasurementUnit,
  MountingPreference,
  PlacedComponent,
  ProjectState,
  SavedDesign,
  SkeletonVariation,
  SkillLevel,
  SpaceDimensions,
  WeightTier,
} from './types/builder';
import { NavbarStepper } from './components/NavbarStepper';
import { MyDesignsSidebar } from './components/MyDesignsSidebar';
import { CascadeModal } from './components/CascadeModal';
import { Step1Welcome } from './components/steps/Step1Welcome';
import { Step2SpaceDesign } from './components/steps/Step2SpaceDesign';
import { Step3Inventory } from './components/steps/Step3Inventory';
import { Step4WeightConfirm } from './components/steps/Step4WeightConfirm';
import { Step5SkeletonVariations } from './components/steps/Step5SkeletonVariations';
import { Step6DetailedDesign } from './components/steps/Step6DetailedDesign';
import { Step7ShoppingList } from './components/steps/Step7ShoppingList';
import { Step8PrintView } from './components/steps/Step8PrintView';
import { CATALOG_SYSTEMS, getSystemById } from './data/catalogLoader';
import {
  estimateWeightRequirement,
  generateSkeletonVariations,
  generateStarterComponentsForVariation,
} from './utils/layoutEngine';

const STORAGE_KEY_ACTIVE = 'builderbuddy_active_state_v1';
const STORAGE_KEY_SAVES = 'builderbuddy_saved_designs_v1';
const STORAGE_KEY_FOLDERS = 'builderbuddy_folders_v1';

const DEFAULT_FOLDERS: DesignFolder[] = [
  { id: 'folder-pantry', name: 'Pantry' },
  { id: 'folder-garage', name: 'Garage' },
  { id: 'folder-closet', name: 'Master & Linen Closets' },
];

const DEFAULT_STATE: ProjectState = {
  currentStep: 1,
  space: {
    wallName: 'Pantry Back Wall A',
    unit: 'in',
    templateId: 'sloped',
    widthInches: 78,
    leftHeightInches: 92,
    rightHeightInches: 48,
    depthInches: 20,
    hasSlopedCeiling: true,
    hasFloorStep: false,
    stepSide: 'right',
    stepWidthInches: 24,
    stepHeightInches: 8,
  },
  selectedCanonicalIds: [
    'canned-goods-glass-jars',
    'dry-bulk-grains-pasta',
    'paper-products-bulk',
    'bulk-detergents-bleach',
  ],
  customItems: [],
  confirmedWeightTier: 'heavy',
  mountingPreference: 'top-track-hanging',
  skillPreference: 'intermediate',
  selectedSystemId: 'elfa-decor-garage',
  selectedVariationId: 'elfa-decor-garage-var-1',
  placedComponents: [],
};

export function App() {
  const [state, setState] = useState<ProjectState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (raw) {
        return JSON.parse(raw) as ProjectState;
      }
    } catch {
      // ignore parse errors
    }
    return DEFAULT_STATE;
  });

  const [folders, setFolders] = useState<DesignFolder[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FOLDERS);
      if (raw) return JSON.parse(raw) as DesignFolder[];
    } catch {
      // ignore
    }
    return DEFAULT_FOLDERS;
  });

  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVES);
      if (raw) return JSON.parse(raw) as SavedDesign[];
    } catch {
      // ignore
    }
    // Provide 2 initial saved examples in the "My Designs" sidebar so the user can see folders immediately
    const initialElfa = CATALOG_SYSTEMS[0];
    const initialVars = generateSkeletonVariations(initialElfa, DEFAULT_STATE.space);
    const starterPlaced =
      initialVars.length > 0
        ? generateStarterComponentsForVariation(initialElfa, initialVars[0])
        : [];
    return [
      {
        id: 'save-seed-pantry',
        name: 'Sloped Pantry Wall A (Elfa Décor+)',
        folderId: 'folder-pantry',
        updatedAt: 'Today',
        state: {
          ...DEFAULT_STATE,
          placedComponents: starterPlaced,
        },
      },
    ];
  });

  const [activeSaveId, setActiveSaveId] = useState<string | null>('save-seed-pantry');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [previousStepBeforeJump, setPreviousStepBeforeJump] = useState<number>(1);

  // Cascade protection modal state when upstream parameters change after Step 5/6 work exists
  const [pendingUpstreamChange, setPendingUpstreamChange] = useState<
    (() => ProjectState) | null
  >(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
    } catch {
      // ignore
    }
  }, [folders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVES, JSON.stringify(savedDesigns));
    } catch {
      // ignore
    }
  }, [savedDesigns]);

  const hasDownstreamWork = state.placedComponents.length > 0;

  const applyOrPromptCascade = (computeNextState: (prev: ProjectState) => ProjectState) => {
    if (hasDownstreamWork && (state.currentStep === 2 || state.currentStep === 4)) {
      setPendingUpstreamChange(() => () => computeNextState(state));
    } else {
      setState((prev) => computeNextState(prev));
    }
  };

  const handleSelectStep = (targetStep: number) => {
    setPreviousStepBeforeJump(state.currentStep);
    setState((prev) => {
      // If advancing to Step 4, sync recommended weight tier if not already set
      if (targetStep === 4 && prev.currentStep === 3) {
        const est = estimateWeightRequirement(prev.selectedCanonicalIds, prev.customItems);
        return {
          ...prev,
          currentStep: targetStep,
          confirmedWeightTier: est.recommendedTier,
        };
      }
      // If advancing to Step 6 and no shelves placed yet, populate starter shelves
      if (targetStep === 6 && prev.placedComponents.length === 0) {
        const sys = getSystemById(prev.selectedSystemId) || CATALOG_SYSTEMS[0];
        const vars = generateSkeletonVariations(sys, prev.space);
        const activeVar =
          vars.find((v) => v.variationId === prev.selectedVariationId) || vars[0];
        const starters = activeVar
          ? generateStarterComponentsForVariation(sys, activeVar)
          : [];
        return {
          ...prev,
          currentStep: targetStep,
          selectedSystemId: sys.systemId,
          selectedVariationId: activeVar?.variationId || null,
          placedComponents: starters,
        };
      }
      return { ...prev, currentStep: targetStep };
    });
  };

  const handleUpdateSpace = (updated: Partial<SpaceDimensions>) => {
    // Switching units ('in' <-> 'cm') or renaming wall does not invalidate layout geometry
    const isOnlyUnitOrName =
      Object.keys(updated).every((k) => k === 'unit' || k === 'wallName');

    if (isOnlyUnitOrName) {
      setState((prev) => ({
        ...prev,
        space: { ...prev.space, ...updated },
      }));
      return;
    }

    applyOrPromptCascade((prev) => {
      const nextSpace = { ...prev.space, ...updated };
      const sys = getSystemById(prev.selectedSystemId) || CATALOG_SYSTEMS[0];
      const nextVars = generateSkeletonVariations(sys, nextSpace);
      const nextVar = nextVars[0] || null;
      const starters = nextVar
        ? generateStarterComponentsForVariation(sys, nextVar)
        : [];
      return {
        ...prev,
        space: nextSpace,
        selectedVariationId: nextVar?.variationId || null,
        placedComponents: prev.placedComponents.length > 0 ? starters : [],
      };
    });
  };

  const handleToggleCanonicalIds = (canonicalIds: string[], select: boolean) => {
    setState((prev) => {
      const set = new Set(prev.selectedCanonicalIds);
      for (const id of canonicalIds) {
        if (select) set.add(id);
        else set.delete(id);
      }
      const nextSelected = Array.from(set);
      const est = estimateWeightRequirement(nextSelected, prev.customItems);
      return {
        ...prev,
        selectedCanonicalIds: nextSelected,
        confirmedWeightTier: est.recommendedTier,
      };
    });
  };

  const handleAddCustomItem = (item: CustomInventoryItem) => {
    setState((prev) => {
      const nextCustom = [...prev.customItems, item];
      const est = estimateWeightRequirement(prev.selectedCanonicalIds, nextCustom);
      return {
        ...prev,
        customItems: nextCustom,
        confirmedWeightTier: est.recommendedTier,
      };
    });
  };

  const handleRemoveCustomItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      customItems: prev.customItems.filter((i) => i.id !== id),
    }));
  };

  const handleChangeWeightTier = (tier: WeightTier) => {
    applyOrPromptCascade((prev) => ({
      ...prev,
      confirmedWeightTier: tier,
      placedComponents: [],
    }));
  };

  const handleChangeMountingPreference = (pref: MountingPreference) => {
    applyOrPromptCascade((prev) => ({
      ...prev,
      mountingPreference: pref,
      placedComponents: [],
    }));
  };

  const handleSelectSystemAndVariation = (
    system: CatalogSystem,
    variation: SkeletonVariation
  ) => {
    setState((prev) => {
      const changedVariation =
        prev.selectedSystemId !== system.systemId ||
        prev.selectedVariationId !== variation.variationId;
      return {
        ...prev,
        selectedSystemId: system.systemId,
        selectedVariationId: variation.variationId,
        placedComponents: changedVariation
          ? generateStarterComponentsForVariation(system, variation)
          : prev.placedComponents,
      };
    });
  };

  const handleSaveNewDesign = (name: string, folderId: string) => {
    const newSave: SavedDesign = {
      id: `save-${Date.now()}`,
      name,
      folderId,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      state: JSON.parse(JSON.stringify(state)),
    };
    setSavedDesigns((prev) => [newSave, ...prev]);
    setActiveSaveId(newSave.id);
  };

  const handleOverwriteDesign = (saveId: string) => {
    setSavedDesigns((prev) =>
      prev.map((d) =>
        d.id === saveId
          ? {
              ...d,
              updatedAt: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              state: JSON.parse(JSON.stringify(state)),
            }
          : d
      )
    );
    setActiveSaveId(saveId);
  };

  const handleLoadPresetDemo = (
    preset: 'pantry-sloped' | 'garage-stepped' | 'closet-standard'
  ) => {
    if (preset === 'pantry-sloped') {
      const sys = getSystemById('elfa-decor-garage') || CATALOG_SYSTEMS[0];
      const vars = generateSkeletonVariations(sys, DEFAULT_STATE.space);
      const starters = vars[0] ? generateStarterComponentsForVariation(sys, vars[0]) : [];
      setState({
        ...DEFAULT_STATE,
        currentStep: 2,
        placedComponents: starters,
      });
    } else if (preset === 'garage-stepped') {
      const garageSpace: SpaceDimensions = {
        wallName: 'Garage North Wall',
        unit: 'in',
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
      };
      const sys = getSystemById('rubbermaid-fasttrack-closetmaid') || CATALOG_SYSTEMS[0];
      const vars = generateSkeletonVariations(sys, garageSpace);
      const starters = vars[0] ? generateStarterComponentsForVariation(sys, vars[0]) : [];
      setState({
        currentStep: 2,
        space: garageSpace,
        selectedCanonicalIds: [
          'power-tools-saws-drills',
          'heavy-toolboxes-hardware',
          'car-cleaning-fluids',
          'storage-totes-bins',
        ],
        customItems: [],
        confirmedWeightTier: 'heavy',
        mountingPreference: 'top-track-hanging',
        skillPreference: 'intermediate',
        selectedSystemId: sys.systemId,
        selectedVariationId: vars[0]?.variationId || null,
        placedComponents: starters,
      });
    }
  };

  // Resolve active system and skeleton variation for Steps 6, 7, 8
  const resolvedSystem = getSystemById(state.selectedSystemId) || CATALOG_SYSTEMS[0];
  const resolvedVariations = generateSkeletonVariations(resolvedSystem, state.space);
  const resolvedVariation =
    resolvedVariations.find((v) => v.variationId === state.selectedVariationId) ||
    resolvedVariations[0];

  const activeSaveObj = savedDesigns.find((d) => d.id === activeSaveId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar & Non-Linear Stepper */}
      <NavbarStepper
        currentStep={state.currentStep}
        onSelectStep={handleSelectStep}
        unit={state.space.unit}
        onToggleUnit={(unit: MeasurementUnit) => handleUpdateSpace({ unit })}
        savedDesignsCount={savedDesigns.length}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        activeSaveName={activeSaveObj?.name || null}
      />

      {/* Main Content + Right-Hand "My Designs" Sidebar */}
      <div className="flex-1 flex flex-col sm:flex-row max-w-[1440px] w-full mx-auto">
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6">
          {state.currentStep === 1 && (
            <Step1Welcome
              onStartBuilding={() => handleSelectStep(2)}
              onLoadPresetDemo={handleLoadPresetDemo}
            />
          )}

          {state.currentStep === 2 && (
            <Step2SpaceDesign
              space={state.space}
              onUpdateSpace={handleUpdateSpace}
              onBack={() => handleSelectStep(1)}
              onNext={() => handleSelectStep(3)}
            />
          )}

          {state.currentStep === 3 && (
            <Step3Inventory
              selectedCanonicalIds={state.selectedCanonicalIds}
              onToggleCanonicalIds={handleToggleCanonicalIds}
              customItems={state.customItems}
              onAddCustomItem={handleAddCustomItem}
              onRemoveCustomItem={handleRemoveCustomItem}
              onBack={() => handleSelectStep(2)}
              onNext={() => handleSelectStep(4)}
            />
          )}

          {state.currentStep === 4 && (
            <Step4WeightConfirm
              space={state.space}
              selectedCanonicalIds={state.selectedCanonicalIds}
              customItems={state.customItems}
              confirmedWeightTier={state.confirmedWeightTier}
              onChangeWeightTier={handleChangeWeightTier}
              mountingPreference={state.mountingPreference}
              onChangeMountingPreference={handleChangeMountingPreference}
              skillPreference={state.skillPreference}
              onChangeSkillPreference={(skill: SkillLevel) =>
                setState((prev) => ({ ...prev, skillPreference: skill }))
              }
              onBack={() => handleSelectStep(3)}
              onNext={() => handleSelectStep(5)}
            />
          )}

          {state.currentStep === 5 && (
            <Step5SkeletonVariations
              space={state.space}
              confirmedWeightTier={state.confirmedWeightTier}
              mountingPreference={state.mountingPreference}
              selectedCanonicalIds={state.selectedCanonicalIds}
              selectedSystemId={state.selectedSystemId}
              selectedVariationId={state.selectedVariationId}
              onSelectSystemAndVariation={handleSelectSystemAndVariation}
              onBack={() => handleSelectStep(4)}
              onNext={() => handleSelectStep(6)}
            />
          )}

          {state.currentStep === 6 && resolvedVariation && (
            <Step6DetailedDesign
              space={state.space}
              system={resolvedSystem}
              variation={resolvedVariation}
              placedComponents={state.placedComponents}
              onUpdatePlacedComponents={(items: PlacedComponent[]) =>
                setState((prev) => ({ ...prev, placedComponents: items }))
              }
              onAutoPopulateStarter={() =>
                setState((prev) => ({
                  ...prev,
                  placedComponents: generateStarterComponentsForVariation(
                    resolvedSystem,
                    resolvedVariation
                  ),
                }))
              }
              onBack={() => handleSelectStep(5)}
              onNext={() => handleSelectStep(7)}
            />
          )}

          {state.currentStep === 7 && resolvedVariation && (
            <Step7ShoppingList
              space={state.space}
              system={resolvedSystem}
              variation={resolvedVariation}
              placedComponents={state.placedComponents}
              onBack={() => handleSelectStep(6)}
              onNextToPrint={() => handleSelectStep(8)}
            />
          )}

          {state.currentStep === 8 && resolvedVariation && (
            <Step8PrintView
              space={state.space}
              system={resolvedSystem}
              variation={resolvedVariation}
              placedComponents={state.placedComponents}
              activeSaveName={activeSaveObj?.name || null}
              onBack={() => handleSelectStep(7)}
            />
          )}
        </main>

        {/* Persistent / Collapsible Right-Hand "My Designs" Sidebar */}
        <MyDesignsSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          folders={folders}
          savedDesigns={savedDesigns}
          activeSaveId={activeSaveId}
          currentWallName={state.space.wallName}
          onCreateFolder={(folderName) =>
            setFolders((prev) => [
              ...prev,
              { id: `folder-${Date.now()}`, name: folderName },
            ])
          }
          onDeleteFolder={(folderId) =>
            setFolders((prev) => prev.filter((f) => f.id !== folderId))
          }
          onSaveNewDesign={handleSaveNewDesign}
          onOverwriteDesign={handleOverwriteDesign}
          onLoadDesign={(design) => {
            setState(JSON.parse(JSON.stringify(design.state)));
            setActiveSaveId(design.id);
          }}
          onDeleteDesign={(saveId) => {
            setSavedDesigns((prev) => prev.filter((d) => d.id !== saveId));
            if (activeSaveId === saveId) setActiveSaveId(null);
          }}
        />
      </div>

      {/* Cascade Protection Confirmation Modal */}
      <CascadeModal
        isOpen={Boolean(pendingUpstreamChange)}
        defaultBranchName={`${state.space.wallName || 'Design'} - Branch Before Change`}
        onSaveBranchAndProceed={(branchName) => {
          const targetFolder =
            activeSaveObj?.folderId || folders[0]?.id || 'folder-pantry';
          handleSaveNewDesign(branchName, targetFolder);
          if (pendingUpstreamChange) {
            setState(pendingUpstreamChange());
          }
          setPendingUpstreamChange(null);
        }}
        onOverwriteAndProceed={() => {
          if (pendingUpstreamChange) {
            setState(pendingUpstreamChange());
          }
          setPendingUpstreamChange(null);
        }}
        onCancelAndReturn={() => {
          setPendingUpstreamChange(null);
          if (previousStepBeforeJump !== state.currentStep) {
            setState((prev) => ({ ...prev, currentStep: previousStepBeforeJump }));
          }
        }}
      />
    </div>
  );
}
export default App;
