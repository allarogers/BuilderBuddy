export type MeasurementUnit = 'in' | 'cm';

export type SpaceTemplateId = 'standard' | 'sloped' | 'stepped' | 'scratch';

export interface SpaceDimensions {
  wallName: string;
  unit: MeasurementUnit;
  templateId: SpaceTemplateId;
  /** Stored internally in decimal inches */
  widthInches: number;
  leftHeightInches: number;
  rightHeightInches: number;
  depthInches: number;
  hasSlopedCeiling: boolean;
  hasFloorStep: boolean;
  stepSide: 'left' | 'right';
  stepWidthInches: number;
  stepHeightInches: number;
}

export type WeightTier = 'light' | 'medium' | 'heavy';

export type MountingPreference = 'any' | 'top-track-hanging' | 'freestanding-frame';

export type SkillLevel = 'beginner' | 'intermediate';

export interface CustomInventoryItem {
  id: string;
  name: string;
  weightTier: WeightTier;
}

export interface InventoryNode {
  id: string;
  /** Canonical ID shared across categories so selecting in one syncs all occurrences */
  canonicalId: string;
  name: string;
  weightLbsPerShelf: number;
  weightTier: WeightTier;
  tag: string;
  children?: InventoryNode[];
}

export type ComponentRole =
  | 'top-track'
  | 'upright-standard'
  | 'bracket'
  | 'shelf'
  | 'drawer'
  | 'basket'
  | 'rod'
  | 'pegboard'
  | 'hardware';

export interface CatalogComponent {
  sku: string;
  name: string;
  role: ComponentRole;
  subType?: string;
  line: string;
  description: string;
  dimensionsInches: {
    width: number;
    depth: number;
    height: number;
  };
  maxWeightLbs: number;
  priceUsd: number;
  requiresBracket?: boolean;
}

export interface CatalogSystem {
  systemId: string;
  brand: string;
  systemName: string;
  line: string;
  compatibleLines: string[];
  vendor: string;
  stores: string[];
  mountingType: 'top-track-hanging' | 'freestanding-frame';
  skillLevel: SkillLevel;
  weightTier: WeightTier;
  maxBayLoadLbs: number;
  maxShelfLoadLbs: number;
  recommendedCategories: string[];
  restrictedTo: string;
  standardBayWidthsInches: number[];
  standardDepthsInches: number[];
  standardUprightHeightsInches: number[];
  verticalSlotIntervalInches: number;
  canCutToFitWidth: boolean;
  description: string;
  badgeColor: string;
  components: CatalogComponent[];
}

export interface SkeletonBay {
  bayIndex: number;
  /** Horizontal start from left edge of wall (inches) */
  xStartInches: number;
  widthInches: number;
  /** Usable top ceiling height at the constraining edge of this bay (inches from main floor) */
  ceilingLimitInches: number;
  /** Floor step offset at this bay (inches from main floor) */
  floorOffsetInches: number;
  /** Assigned upright height on left & right of this bay */
  leftUprightHeightInches: number;
  rightUprightHeightInches: number;
  /** Top track height from main floor (inches) */
  topTrackYInches: number;
}

export interface SkeletonUpright {
  uprightIndex: number;
  xInches: number;
  topYInches: number;
  heightInches: number;
  sku: string;
  name: string;
  priceUsd: number;
}

export interface SkeletonVariation {
  variationId: string;
  systemId: string;
  variationNumber: number;
  title: string;
  optimizationBadge: string;
  description: string;
  totalCoveredWidthInches: number;
  coveragePercent: number;
  estimatedMaxLoadLbs: number;
  skeletonCostUsd: number;
  bays: SkeletonBay[];
  uprights: SkeletonUpright[];
  topTracks: {
    sku: string;
    name: string;
    widthInches: number;
    quantity: number;
    unitPriceUsd: number;
  }[];
}

export interface PlacedComponent {
  id: string;
  bayIndex: number;
  sku: string;
  name: string;
  role: ComponentRole;
  subType?: string;
  line: string;
  widthInches: number;
  depthInches: number;
  heightInches: number;
  /** Distance from main floor (bottom of room) in inches */
  yFromFloorInches: number;
  maxWeightLbs: number;
  priceUsd: number;
  requiresBracket?: boolean;
}

export interface BOMLineItem {
  sku: string;
  name: string;
  role: ComponentRole;
  roleLabel: string;
  dimensionsInches: {
    width: number;
    depth: number;
    height: number;
  };
  description: string;
  quantity: number;
  unitPriceUsd: number;
  lineTotalUsd: number;
}

export interface ProjectState {
  currentStep: number;
  space: SpaceDimensions;
  selectedCanonicalIds: string[];
  customItems: CustomInventoryItem[];
  confirmedWeightTier: WeightTier;
  mountingPreference: MountingPreference;
  skillPreference: SkillLevel;
  selectedSystemId: string | null;
  selectedVariationId: string | null;
  placedComponents: PlacedComponent[];
}

export interface SavedDesign {
  id: string;
  name: string;
  folderId: string;
  updatedAt: string;
  state: ProjectState;
}

export interface DesignFolder {
  id: string;
  name: string;
}
