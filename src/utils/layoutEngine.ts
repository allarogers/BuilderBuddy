import {
  BOMLineItem,
  CatalogComponent,
  CatalogSystem,
  CustomInventoryItem,
  MountingPreference,
  PlacedComponent,
  SkeletonBay,
  SkeletonUpright,
  SkeletonVariation,
  SpaceDimensions,
  WeightTier,
} from '../types/builder';
import { flattenInventoryNodes } from '../data/categories';
import { CATALOG_SYSTEMS } from '../data/catalogLoader';

/**
 * Computes ceiling height at any horizontal position x (in inches from left edge of wall)
 */
export function getCeilingHeightAtX(space: SpaceDimensions, xInches: number): number {
  const clampedX = Math.max(0, Math.min(space.widthInches, xInches));
  if (!space.hasSlopedCeiling) {
    return space.leftHeightInches;
  }
  const ratio = space.widthInches > 0 ? clampedX / space.widthInches : 0;
  return space.leftHeightInches + ratio * (space.rightHeightInches - space.leftHeightInches);
}

/**
 * Computes floor offset (step height) at horizontal position x
 */
export function getFloorOffsetAtX(space: SpaceDimensions, xInches: number): number {
  if (!space.hasFloorStep || space.stepWidthInches <= 0 || space.stepHeightInches <= 0) {
    return 0;
  }
  if (space.stepSide === 'left') {
    return xInches <= space.stepWidthInches ? space.stepHeightInches : 0;
  } else {
    return xInches >= space.widthInches - space.stepWidthInches ? space.stepHeightInches : 0;
  }
}

/**
 * Estimates required weight load tier & lbs per shelf from Step 3 selections
 */
export function estimateWeightRequirement(
  selectedCanonicalIds: string[],
  customItems: CustomInventoryItem[]
): {
  recommendedTier: WeightTier;
  estimatedMaxShelfLbs: number;
  estimatedBayLbs: number;
  heavyItemsTriggered: string[];
  tags: string[];
} {
  const allNodes = flattenInventoryNodes();
  const matched = allNodes.filter((n) => selectedCanonicalIds.includes(n.canonicalId));

  let maxShelfLbs = 20;
  const heavyItemsSet = new Set<string>();
  const tagSet = new Set<string>();

  for (const node of matched) {
    tagSet.add(node.tag);
    if (node.weightLbsPerShelf > maxShelfLbs) {
      maxShelfLbs = node.weightLbsPerShelf;
    }
    if (node.weightTier === 'heavy') {
      heavyItemsSet.add(node.name.replace(/\s*\(Shared.*\)/i, ''));
    }
  }

  for (const custom of customItems) {
    if (custom.weightTier === 'heavy') {
      maxShelfLbs = Math.max(maxShelfLbs, 65);
      heavyItemsSet.add(`${custom.name} (Custom Heavy)`);
    } else if (custom.weightTier === 'medium') {
      maxShelfLbs = Math.max(maxShelfLbs, 35);
    } else {
      maxShelfLbs = Math.max(maxShelfLbs, 15);
    }
  }

  let recommendedTier: WeightTier = 'light';
  if (maxShelfLbs >= 45 || heavyItemsSet.size > 0) {
    recommendedTier = 'heavy';
  } else if (maxShelfLbs >= 25) {
    recommendedTier = 'medium';
  }

  const estimatedBayLbs = maxShelfLbs * 4;

  return {
    recommendedTier,
    estimatedMaxShelfLbs: maxShelfLbs,
    estimatedBayLbs,
    heavyItemsTriggered: Array.from(heavyItemsSet),
    tags: Array.from(tagSet),
  };
}

const TIER_RANK: Record<WeightTier, number> = {
  light: 1,
  medium: 2,
  heavy: 3,
};

/**
 * Filters systems that fit the user's space dimensions, depth, mounting preference, and confirmed weight load
 */
export function getMatchingSystems(
  space: SpaceDimensions,
  confirmedWeightTier: WeightTier,
  mountingPreference: MountingPreference,
  selectedCanonicalIds: string[]
): {
  matching: CatalogSystem[];
  allWithStatus: { system: CatalogSystem; matches: boolean; reasons: string[] }[];
} {
  const minBayWidth = Math.min(...CATALOG_SYSTEMS.flatMap((s) => s.standardBayWidthsInches));
  const maxWallHeight = Math.max(space.leftHeightInches, space.rightHeightInches);

  const allWithStatus = CATALOG_SYSTEMS.map((system) => {
    const reasons: string[] = [];

    // Check weight tier
    if (TIER_RANK[system.weightTier] < TIER_RANK[confirmedWeightTier]) {
      reasons.push(
        `Rated for ${system.weightTier} loads (${system.maxShelfLoadLbs} lbs/shelf), below confirmed ${confirmedWeightTier} load tier.`
      );
    }

    // Check mounting preference
    if (mountingPreference !== 'any' && system.mountingType !== mountingPreference) {
      reasons.push(
        `System is ${
          system.mountingType === 'top-track-hanging' ? 'Wall-Mounted' : 'Freestanding'
        }, which differs from your selected mounting filter.`
      );
    }

    // Check room depth
    const minDepth = Math.min(...system.standardDepthsInches);
    if (minDepth > space.depthInches) {
      reasons.push(`Minimum shelf depth (${minDepth}") exceeds your usable room depth (${space.depthInches}").`);
    }

    // Check minimum bay width
    const smallestBay = Math.min(...system.standardBayWidthsInches);
    if (smallestBay > space.widthInches - 1.5) {
      reasons.push(`Smallest bay width (${smallestBay}") is wider than your wall (${space.widthInches}").`);
    }

    // Check minimum upright height
    const shortestUpright = Math.min(...system.standardUprightHeightsInches);
    if (shortestUpright > maxWallHeight - 2) {
      reasons.push(`Shortest frame/upright (${shortestUpright}") is taller than your wall (${maxWallHeight}").`);
    }

    return {
      system,
      matches: reasons.length === 0,
      reasons,
    };
  });

  const matching = allWithStatus.filter((x) => x.matches).map((x) => x.system);
  return { matching, allWithStatus };
}

/**
 * Generates up to 5 structural skeleton variations for a given system and wall space
 */
export function generateSkeletonVariations(
  system: CatalogSystem,
  space: SpaceDimensions
): SkeletonVariation[] {
  const usableWallWidth = Math.max(12, space.widthInches - 2); // 1" margin on each side for outer upright width
  const sortedWidthsAsc = [...system.standardBayWidthsInches].sort((a, b) => a - b);
  const sortedWidthsDesc = [...system.standardBayWidthsInches].sort((a, b) => b - a);

  // Strategy 1: Maximum Wall Coverage (Balanced DP combination)
  const comboBalanced = findBestWidthCombination(usableWallWidth, sortedWidthsDesc, 'max-coverage');
  // Strategy 2: Wider Bays (Fewer Uprights / Lower Cost)
  const comboWide = findBestWidthCombination(usableWallWidth, sortedWidthsDesc, 'wide-first');
  // Strategy 3: High Load Density (Narrower Bays / More Uprights)
  const comboNarrow = findBestWidthCombination(usableWallWidth, sortedWidthsAsc, 'narrow-first');
  // Strategy 4: Slope / Step Hugging (Adaptive mix tailored to slope/step transitions)
  const comboAdaptive = findAdaptiveSlopeStepCombination(usableWallWidth, sortedWidthsAsc, space);
  // Strategy 5: Centered / Symmetrical Layout (Palindrome bay arrangement)
  const comboSymmetrical = findSymmetricalCombination(usableWallWidth, sortedWidthsDesc);

  const strategies: {
    number: number;
    title: string;
    badge: string;
    description: string;
    bayWidths: number[];
    alignMode: 'center' | 'left' | 'slope-tall-side';
    hugSlope: boolean;
  }[] = [
    {
      number: 1,
      title: 'Maximum Wall Coverage (Balanced)',
      badge: 'Best Overall Space Fit',
      description:
        'Optimizes horizontal wall coverage using a balanced mix of standard bay widths with minimal wasted margin.',
      bayWidths: comboBalanced,
      alignMode: 'center',
      hugSlope: true,
    },
    {
      number: 2,
      title: 'Wider Bays (Fewer Uprights & Lower Cost)',
      badge: 'Cost & Hardware Efficient',
      description:
        'Prioritizes the widest available bays to reduce the number of vertical uprights and brackets required.',
      bayWidths: comboWide,
      alignMode: 'center',
      hugSlope: false,
    },
    {
      number: 3,
      title: 'High Load Density (Narrower Bays)',
      badge: 'Maximum Weight Capacity',
      description:
        'Uses narrower bay spans with extra vertical uprights to maximize structural weight load per linear foot.',
      bayWidths: comboNarrow,
      alignMode: 'center',
      hugSlope: true,
    },
    {
      number: 4,
      title: 'Slope & Step Hugging Profile',
      badge: 'Irregular Wall Specialist',
      description:
        'Steps upright lengths and shifts bay boundaries to capture maximum storage under sloped ceilings or over floor steps.',
      bayWidths: comboAdaptive,
      alignMode: 'slope-tall-side',
      hugSlope: true,
    },
    {
      number: 5,
      title: 'Centered Symmetrical Architecture',
      badge: 'Balanced Visual Symmetry',
      description:
        'Arranges bay widths symmetrically around the center of the wall for a clean, built-in architectural look.',
      bayWidths: comboSymmetrical,
      alignMode: 'center',
      hugSlope: true,
    },
  ];

  const variations: SkeletonVariation[] = [];

  for (const strat of strategies) {
    if (strat.bayWidths.length === 0) continue;
    const built = buildSkeletonFromBayWidths(
      system,
      space,
      strat.bayWidths,
      strat.number,
      strat.title,
      strat.badge,
      strat.description,
      strat.alignMode,
      strat.hugSlope
    );
    if (built) {
      variations.push(built);
    }
  }

  return variations;
}

function findBestWidthCombination(
  maxWidth: number,
  widths: number[],
  mode: 'max-coverage' | 'wide-first' | 'narrow-first'
): number[] {
  const minW = Math.min(...widths);
  if (maxWidth < minW) return [];

  if (mode === 'wide-first') {
    const result: number[] = [];
    let rem = maxWidth;
    const desc = [...widths].sort((a, b) => b - a);
    for (const w of desc) {
      while (rem >= w) {
        result.push(w);
        rem -= w;
      }
    }
    return result;
  }

  if (mode === 'narrow-first') {
    const result: number[] = [];
    let rem = maxWidth;
    const asc = [...widths].sort((a, b) => a - b);
    for (const w of asc) {
      while (rem >= w) {
        result.push(w);
        rem -= w;
      }
    }
    return result;
  }

  // 'max-coverage': search combinations up to 7 bays to minimize leftover space
  let bestCombo: number[] = [];
  let bestSum = 0;

  function dfs(current: number[], sum: number, startIdx: number) {
    if (sum > bestSum || (Math.abs(sum - bestSum) < 0.01 && current.length < bestCombo.length)) {
      bestSum = sum;
      bestCombo = [...current];
    }
    if (current.length >= 7) return;
    for (let i = startIdx; i < widths.length; i++) {
      const w = widths[i];
      if (sum + w <= maxWidth + 0.01) {
        current.push(w);
        dfs(current, sum + w, i);
        current.pop();
      }
    }
  }

  dfs([], 0, 0);
  return bestCombo;
}

function findAdaptiveSlopeStepCombination(
  maxWidth: number,
  widthsAsc: number[],
  space: SpaceDimensions
): number[] {
  const base = findBestWidthCombination(maxWidth, widthsAsc, 'max-coverage');
  if (base.length <= 1) return base;
  // Sort narrower bays toward the shorter ceiling side or stepped side so stepped uprights hug the slope tightly
  const leftIsShorter = space.hasSlopedCeiling && space.leftHeightInches < space.rightHeightInches;
  if (leftIsShorter) {
    return [...base].sort((a, b) => a - b);
  }
  return [...base].sort((a, b) => b - a);
}

function findSymmetricalCombination(maxWidth: number, widthsDesc: number[]): number[] {
  const minW = Math.min(...widthsDesc);
  if (maxWidth < minW) return [];

  // Try center bay + mirrored pairs, or purely mirrored pairs
  let best: number[] = [];
  let bestTotal = 0;

  const candidates: number[][] = [];

  // Pure pairs
  for (const w1 of widthsDesc) {
    if (w1 * 2 <= maxWidth) candidates.push([w1, w1]);
    if (w1 * 4 <= maxWidth) candidates.push([w1, w1, w1, w1]);
  }

  // Center + wings
  for (const center of widthsDesc) {
    if (center <= maxWidth) candidates.push([center]);
    for (const wing of widthsDesc) {
      if (wing * 2 + center <= maxWidth) {
        candidates.push([wing, center, wing]);
      }
      if (wing * 4 + center <= maxWidth) {
        candidates.push([wing, wing, center, wing, wing]);
      }
    }
  }

  for (const c of candidates) {
    const sum = c.reduce((acc, v) => acc + v, 0);
    if (sum > bestTotal) {
      bestTotal = sum;
      best = c;
    }
  }

  return best.length > 0 ? best : findBestWidthCombination(maxWidth, widthsDesc, 'max-coverage');
}

function buildSkeletonFromBayWidths(
  system: CatalogSystem,
  space: SpaceDimensions,
  bayWidths: number[],
  variationNumber: number,
  title: string,
  optimizationBadge: string,
  description: string,
  alignMode: 'center' | 'left' | 'slope-tall-side',
  hugSlope: boolean
): SkeletonVariation | null {
  const totalWidth = bayWidths.reduce((a, b) => a + b, 0);
  if (totalWidth > space.widthInches) return null;

  let startX = (space.widthInches - totalWidth) / 2;
  if (alignMode === 'left') {
    startX = Math.min(2, (space.widthInches - totalWidth) / 2);
  } else if (alignMode === 'slope-tall-side' && space.hasSlopedCeiling) {
    startX =
      space.leftHeightInches >= space.rightHeightInches
        ? Math.min(1.5, (space.widthInches - totalWidth) / 2)
        : Math.max(1.5, space.widthInches - totalWidth - 1.5);
  }

  // Determine upright x positions (N bays => N + 1 uprights)
  const uprightXs: number[] = [startX];
  let cursor = startX;
  for (const w of bayWidths) {
    cursor += w;
    uprightXs.push(cursor);
  }

  const uprightComponents = system.components
    .filter((c) => c.role === 'upright-standard')
    .sort((a, b) => b.dimensionsInches.height - a.dimensionsInches.height);

  if (uprightComponents.length === 0) return null;

  // For each upright x, pick the longest upright that fits between ceiling(x) - 2" and floorOffset(x)
  const rawUprights: {
    x: number;
    ceilingY: number;
    floorY: number;
    availableH: number;
    comp: CatalogComponent;
  }[] = [];

  for (const x of uprightXs) {
    const ceilingY = getCeilingHeightAtX(space, x);
    const floorY = getFloorOffsetAtX(space, x);
    const availableH = Math.max(10, ceilingY - floorY - 1.5);

    // Pick tallest upright that fits availableH; if none fit, pick shortest available upright
    let chosen =
      uprightComponents.find((u) => u.dimensionsInches.height <= availableH) ||
      uprightComponents[uprightComponents.length - 1];

    rawUprights.push({
      x,
      ceilingY,
      floorY,
      availableH,
      comp: chosen,
    });
  }

  // If not hugging slope, unify upright heights to the safest shared height
  if (!hugSlope && rawUprights.length > 0) {
    const minChosenHeight = Math.min(...rawUprights.map((u) => u.comp.dimensionsInches.height));
    const unifiedComp =
      uprightComponents.find((u) => u.dimensionsInches.height === minChosenHeight) ||
      rawUprights[0].comp;
    rawUprights.forEach((u) => {
      u.comp = unifiedComp;
    });
  }

  const uprights: SkeletonUpright[] = rawUprights.map((u, idx) => {
    const h = u.comp.dimensionsInches.height;
    // For wall-hung systems, hang near the ceiling (or stepped top track); for freestanding frames, sit on the floor/step
    let topY = u.ceilingY - 2;
    if (system.mountingType === 'freestanding-frame') {
      topY = u.floorY + h;
    } else {
      // Ensure upright bottom doesn't go below floor step
      if (topY - h < u.floorY + 1) {
        topY = Math.min(u.ceilingY - 1, u.floorY + h + 1);
      }
    }

    return {
      uprightIndex: idx,
      xInches: Number(u.x.toFixed(2)),
      topYInches: Number(topY.toFixed(2)),
      heightInches: h,
      sku: u.comp.sku,
      name: u.comp.name,
      priceUsd: u.comp.priceUsd,
    };
  });

  const bays: SkeletonBay[] = bayWidths.map((w, idx) => {
    const leftUp = uprights[idx];
    const rightUp = uprights[idx + 1];
    const bayLeftX = leftUp.xInches;
    const bayRightX = rightUp.xInches;
    const ceilingLimit = Math.min(
      getCeilingHeightAtX(space, bayLeftX),
      getCeilingHeightAtX(space, bayRightX)
    );
    const floorOffset = Math.max(
      getFloorOffsetAtX(space, bayLeftX),
      getFloorOffsetAtX(space, bayRightX)
    );
    const topTrackY = Math.min(leftUp.topYInches, rightUp.topYInches);

    return {
      bayIndex: idx,
      xStartInches: bayLeftX,
      widthInches: w,
      ceilingLimitInches: Number(ceilingLimit.toFixed(2)),
      floorOffsetInches: Number(floorOffset.toFixed(2)),
      leftUprightHeightInches: leftUp.heightInches,
      rightUprightHeightInches: rightUp.heightInches,
      topTrackYInches: Number(topTrackY.toFixed(2)),
    };
  });

  // Top tracks calculation
  const trackComps = system.components
    .filter((c) => c.role === 'top-track')
    .sort((a, b) => b.dimensionsInches.width - a.dimensionsInches.width);

  const topTracks: SkeletonVariation['topTracks'] = [];
  if (trackComps.length > 0) {
    let remTrackWidth = totalWidth;
    const trackCounts = new Map<string, { comp: CatalogComponent; count: number }>();

    while (remTrackWidth > 0.5) {
      // Pick smallest track >= remTrackWidth or largest track
      const ascending = [...trackComps].sort(
        (a, b) => a.dimensionsInches.width - b.dimensionsInches.width
      );
      const picked =
        ascending.find((t) => t.dimensionsInches.width >= remTrackWidth) || trackComps[0];
      const existing = trackCounts.get(picked.sku);
      if (existing) {
        existing.count += 1;
      } else {
        trackCounts.set(picked.sku, { comp: picked, count: 1 });
      }
      remTrackWidth -= picked.dimensionsInches.width;
    }

    trackCounts.forEach(({ comp, count }) => {
      topTracks.push({
        sku: comp.sku,
        name: comp.name,
        widthInches: comp.dimensionsInches.width,
        quantity: count,
        unitPriceUsd: comp.priceUsd,
      });
    });
  }

  const uprightsCost = uprights.reduce((sum, u) => sum + u.priceUsd, 0);
  const tracksCost = topTracks.reduce((sum, t) => sum + t.unitPriceUsd * t.quantity, 0);
  const skeletonCostUsd = Number((uprightsCost + tracksCost).toFixed(2));
  const coveragePercent = Math.min(100, Math.round((totalWidth / space.widthInches) * 100));
  const estimatedMaxLoadLbs = bays.length * system.maxBayLoadLbs;

  return {
    variationId: `${system.systemId}-var-${variationNumber}`,
    systemId: system.systemId,
    variationNumber,
    title,
    optimizationBadge,
    description,
    totalCoveredWidthInches: Number(totalWidth.toFixed(2)),
    coveragePercent,
    estimatedMaxLoadLbs,
    skeletonCostUsd,
    bays,
    uprights,
    topTracks,
  };
}

/**
 * Generates starter default shelves when user first enters Step 6 with an empty bay layout
 */
export function generateStarterComponentsForVariation(
  system: CatalogSystem,
  variation: SkeletonVariation
): PlacedComponent[] {
  const placed: PlacedComponent[] = [];
  const shelfComps = system.components.filter((c) => c.role === 'shelf');

  variation.bays.forEach((bay) => {
    const matchingShelf = shelfComps.find(
      (s) => Math.abs(s.dimensionsInches.width - bay.widthInches) < 0.5
    );
    if (!matchingShelf) return;

    const minBottom = Math.max(
      bay.floorOffsetInches + 8,
      bay.topTrackYInches - Math.min(bay.leftUprightHeightInches, bay.rightUprightHeightInches) + 4
    );
    const maxTop = bay.topTrackYInches - 6;

    const heights = [0.25, 0.55, 0.82];
    heights.forEach((ratio, idx) => {
      const rawY = minBottom + ratio * (maxTop - minBottom);
      const snappedY = snapToSlotInterval(rawY, system.verticalSlotIntervalInches, minBottom, maxTop);
      if (snappedY >= minBottom && snappedY <= maxTop) {
        placed.push({
          id: `starter-${bay.bayIndex}-${idx}`,
          bayIndex: bay.bayIndex,
          sku: matchingShelf.sku,
          name: matchingShelf.name,
          role: matchingShelf.role,
          subType: matchingShelf.subType,
          line: matchingShelf.line,
          widthInches: matchingShelf.dimensionsInches.width,
          depthInches: matchingShelf.dimensionsInches.depth,
          heightInches: matchingShelf.dimensionsInches.height,
          yFromFloorInches: snappedY,
          maxWeightLbs: matchingShelf.maxWeightLbs,
          priceUsd: matchingShelf.priceUsd,
          requiresBracket: matchingShelf.requiresBracket,
        });
      }
    });
  });

  return placed;
}

export function snapToSlotInterval(
  valueInches: number,
  intervalInches: number,
  minInches: number,
  maxInches: number
): number {
  const step = intervalInches > 0 ? intervalInches : 1.0;
  const snapped = Math.round(valueInches / step) * step;
  return Number(Math.max(minInches, Math.min(maxInches, snapped)).toFixed(2));
}

const ROLE_LABELS: Record<string, string> = {
  'top-track': 'Structural Frame / Tracks',
  'upright-standard': 'Uprights & Frame Standards',
  bracket: 'Brackets & Mounting Hardware',
  hardware: 'Brackets & Mounting Hardware',
  shelf: 'Shelves',
  drawer: 'Drawers & Gliding Baskets',
  basket: 'Drawers & Gliding Baskets',
  rod: 'Clothes Rods & Pegboard Panels',
  pegboard: 'Clothes Rods & Pegboard Panels',
};

/**
 * Generates the complete Bill of Materials (Step 7 & Step 8) with automatic bracket & anchor resolution
 */
export function generateBillOfMaterials(
  system: CatalogSystem,
  variation: SkeletonVariation,
  placedComponents: PlacedComponent[]
): {
  items: BOMLineItem[];
  groupedItems: Record<string, BOMLineItem[]>;
  totalCostUsd: number;
  totalPartsCount: number;
} {
  const map = new Map<string, BOMLineItem>();

  const addOrIncrement = (comp: CatalogComponent, qty: number) => {
    if (qty <= 0) return;
    const existing = map.get(comp.sku);
    if (existing) {
      existing.quantity += qty;
      existing.lineTotalUsd = Number((existing.quantity * existing.unitPriceUsd).toFixed(2));
    } else {
      map.set(comp.sku, {
        sku: comp.sku,
        name: comp.name,
        role: comp.role,
        roleLabel: ROLE_LABELS[comp.role] || 'Accessories',
        dimensionsInches: comp.dimensionsInches,
        description: comp.description,
        quantity: qty,
        unitPriceUsd: comp.priceUsd,
        lineTotalUsd: Number((qty * comp.priceUsd).toFixed(2)),
      });
    }
  };

  // 1. Top Tracks from Skeleton Variation
  variation.topTracks.forEach((t) => {
    const comp = system.components.find((c) => c.sku === t.sku);
    if (comp) addOrIncrement(comp, t.quantity);
  });

  // 2. Uprights from Skeleton Variation
  variation.uprights.forEach((u) => {
    const comp = system.components.find((c) => c.sku === u.sku);
    if (comp) addOrIncrement(comp, 1);
  });

  // 3. Placed Interior Components + Auto-Resolved Brackets
  const bracketComps = system.components.filter((c) => c.role === 'bracket');
  for (const placed of placedComponents) {
    const catalogComp = system.components.find((c) => c.sku === placed.sku);
    if (catalogComp) {
      addOrIncrement(catalogComp, 1);
    }

    if (placed.requiresBracket && bracketComps.length > 0) {
      // Find matching depth bracket (or closest depth)
      const matchingBracket =
        bracketComps.find((b) => Math.abs(b.dimensionsInches.depth - placed.depthInches) < 1.0) ||
        bracketComps[0];
      addOrIncrement(matchingBracket, 2); // Left + Right bracket per placed shelf/basket/drawer
    }
  }

  // 4. Drywall Anchor Hardware Pack (1 pack per 2 uprights for wall-mounted systems)
  const anchorComp = system.components.find((c) => c.role === 'hardware');
  if (anchorComp) {
    const packsNeeded = Math.max(1, Math.ceil(variation.uprights.length / 2));
    addOrIncrement(anchorComp, packsNeeded);
  }

  const items = Array.from(map.values());
  const groupedItems: Record<string, BOMLineItem[]> = {};
  for (const item of items) {
    if (!groupedItems[item.roleLabel]) {
      groupedItems[item.roleLabel] = [];
    }
    groupedItems[item.roleLabel].push(item);
  }

  const totalCostUsd = Number(items.reduce((sum, i) => sum + i.lineTotalUsd, 0).toFixed(2));
  const totalPartsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    items,
    groupedItems,
    totalCostUsd,
    totalPartsCount,
  };
}
