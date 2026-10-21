import React, { useState, useRef } from 'react';
import {
  PlacedComponent,
  SkeletonVariation,
  SpaceDimensions,
} from '../../types/builder';
import { formatLength, inchesToUnit, unitToInches } from '../../utils/units';
import { getCeilingHeightAtX, getFloorOffsetAtX, snapToSlotInterval } from '../../utils/layoutEngine';
import { Trash2, ArrowUpDown, Layers, Eye, Compass } from 'lucide-react';

interface SpaceCanvasProps {
  space: SpaceDimensions;
  viewMode: 'elevation' | 'top';
  onToggleViewMode?: (mode: 'elevation' | 'top') => void;
  onChangeSpace?: (updated: Partial<SpaceDimensions>) => void;
  editableDimensions?: boolean;
  skeleton?: SkeletonVariation | null;
  placedComponents?: PlacedComponent[];
  selectedBayIndex?: number | null;
  onSelectBay?: (bayIndex: number) => void;
  interactivePlacement?: boolean;
  slotIntervalInches?: number;
  onMoveComponent?: (componentId: string, newYFromFloorInches: number) => void;
  onRemoveComponent?: (componentId: string) => void;
  blueprintMode?: boolean;
}

type EditingField =
  | 'width'
  | 'leftHeight'
  | 'rightHeight'
  | 'depth'
  | 'stepWidth'
  | 'stepHeight'
  | null;

export const SpaceCanvas: React.FC<SpaceCanvasProps> = ({
  space,
  viewMode,
  onToggleViewMode,
  onChangeSpace,
  editableDimensions = false,
  skeleton = null,
  placedComponents = [],
  selectedBayIndex = null,
  onSelectBay,
  interactivePlacement = false,
  slotIntervalInches = 1.25,
  onMoveComponent,
  onRemoveComponent,
  blueprintMode = false,
}) => {
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const unit = space.unit;
  const maxWallH = Math.max(space.leftHeightInches, space.rightHeightInches, 24);
  const wallW = Math.max(space.widthInches, 24);
  const roomD = Math.max(space.depthInches, 12);

  // Proportional scaling into a clean SVG viewport (occupying ~80% of canvas)
  const VIEWPORT_W = 860;
  const VIEWPORT_H = blueprintMode ? 440 : 500;
  const PADDING_X = 100;
  const PADDING_Y = 75;

  const usableW = VIEWPORT_W - PADDING_X * 2;
  const usableH = VIEWPORT_H - PADDING_Y * 2;

  const targetModelW = viewMode === 'elevation' ? wallW : wallW;
  const targetModelH = viewMode === 'elevation' ? maxWallH : roomD;

  const scale = Math.min(usableW / targetModelW, usableH / targetModelH);
  const drawnW = targetModelW * scale;
  const drawnH = targetModelH * scale;

  const originX = (VIEWPORT_W - drawnW) / 2;
  // In elevation view, bottom of wall (y=0 in inches) is at originYBottom
  const originYBottom = (VIEWPORT_H + drawnH) / 2;
  const originYTop = (VIEWPORT_H - drawnH) / 2;

  const toSvgX = (xInches: number) => originX + xInches * scale;
  const toSvgY = (yFromFloorInches: number) => originYBottom - yFromFloorInches * scale;

  const openEditor = (field: EditingField, currentInches: number) => {
    if (!editableDimensions || !onChangeSpace) return;
    setEditingField(field);
    setInputValue(String(inchesToUnit(currentInches, unit)));
  };

  const commitEditor = () => {
    if (!editingField || !onChangeSpace) {
      setEditingField(null);
      return;
    }
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed > 0) {
      const inches = unitToInches(parsed, unit);
      if (editingField === 'width') {
        onChangeSpace({ widthInches: Math.max(18, Math.min(360, inches)) });
      } else if (editingField === 'leftHeight') {
        const clamped = Math.max(20, Math.min(240, inches));
        onChangeSpace(
          space.hasSlopedCeiling
            ? { leftHeightInches: clamped }
            : { leftHeightInches: clamped, rightHeightInches: clamped }
        );
      } else if (editingField === 'rightHeight') {
        onChangeSpace({ rightHeightInches: Math.max(20, Math.min(240, inches)) });
      } else if (editingField === 'depth') {
        onChangeSpace({ depthInches: Math.max(8, Math.min(180, inches)) });
      } else if (editingField === 'stepWidth') {
        onChangeSpace({
          stepWidthInches: Math.max(4, Math.min(space.widthInches - 12, inches)),
        });
      } else if (editingField === 'stepHeight') {
        onChangeSpace({
          stepHeightInches: Math.max(2, Math.min(maxWallH - 24, inches)),
        });
      }
    }
    setEditingField(null);
  };

  // Build polygon points for Elevation View wall shape
  const buildWallPolygonPoints = () => {
    const leftTopY = toSvgY(space.leftHeightInches);
    const rightTopY = toSvgY(
      space.hasSlopedCeiling ? space.rightHeightInches : space.leftHeightInches
    );
    const leftX = toSvgX(0);
    const rightX = toSvgX(space.widthInches);
    const floorY = toSvgY(0);

    const pts: string[] = [];
    // Top-left to top-right
    pts.push(`${leftX},${leftTopY}`);
    pts.push(`${rightX},${rightTopY}`);

    // Bottom edge (handling optional floor step)
    if (space.hasFloorStep && space.stepWidthInches > 0 && space.stepHeightInches > 0) {
      const stepH_Y = toSvgY(space.stepHeightInches);
      if (space.stepSide === 'right') {
        const stepStartX = toSvgX(space.widthInches - space.stepWidthInches);
        pts.push(`${rightX},${stepH_Y}`);
        pts.push(`${stepStartX},${stepH_Y}`);
        pts.push(`${stepStartX},${floorY}`);
        pts.push(`${leftX},${floorY}`);
      } else {
        const stepEndX = toSvgX(space.stepWidthInches);
        pts.push(`${rightX},${floorY}`);
        pts.push(`${stepEndX},${floorY}`);
        pts.push(`${stepEndX},${stepH_Y}`);
        pts.push(`${leftX},${stepH_Y}`);
      }
    } else {
      pts.push(`${rightX},${floorY}`);
      pts.push(`${leftX},${floorY}`);
    }

    return pts.join(' ');
  };

  // Pointer drag handler for moving shelves/components vertically in Step 6
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingId || !interactivePlacement || !onMoveComponent || !svgRef.current || !skeleton) {
      return;
    }
    const comp = placedComponents.find((c) => c.id === draggingId);
    if (!comp) return;
    const bay = skeleton.bays.find((b) => b.bayIndex === comp.bayIndex);
    if (!bay) return;

    const rect = svgRef.current.getBoundingClientRect();
    const svgY = ((e.clientY - rect.top) / rect.height) * VIEWPORT_H;
    const rawInchesFromFloor = (originYBottom - svgY) / scale;

    const minY = Math.max(
      bay.floorOffsetInches + 4,
      bay.topTrackYInches - Math.min(bay.leftUprightHeightInches, bay.rightUprightHeightInches) + 3
    );
    const maxY = bay.topTrackYInches - comp.heightInches - 2;
    const snapped = snapToSlotInterval(rawInchesFromFloor, slotIntervalInches, minY, maxY);
    onMoveComponent(draggingId, snapped);
  };

  const handlePointerUp = () => {
    if (draggingId) {
      setDraggingId(null);
    }
  };

  return (
    <div className="relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Toolbar (Hidden in blueprint print mode) */}
      {!blueprintMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              {space.wallName || 'Unnamed Wall'}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              • Scaled proportionally ({formatLength(space.widthInches, unit)} W ×{' '}
              {formatLength(maxWallH, unit)} H)
            </span>
          </div>

          {onToggleViewMode && (
            <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5">
              <button
                type="button"
                onClick={() => onToggleViewMode('elevation')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === 'elevation'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Side / Elevation View
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('top')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === 'top'
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Top / Plan View
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inline Dimension Popup Modal */}
      {editingField && (
        <div className="absolute inset-0 z-30 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-72 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              Edit{' '}
              {editingField === 'width'
                ? 'Wall Width'
                : editingField === 'leftHeight'
                ? space.hasSlopedCeiling
                  ? 'Left Wall Height'
                  : 'Ceiling Height'
                : editingField === 'rightHeight'
                ? 'Right Wall Height'
                : editingField === 'depth'
                ? 'Usable Room Depth'
                : editingField === 'stepWidth'
                ? 'Floor Step Width'
                : 'Floor Step Height'}{' '}
              ({unit})
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Enter measurement in {unit === 'cm' ? 'centimeters' : 'decimal inches'}:
            </p>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                step="0.25"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEditor();
                  if (e.key === 'Escape') setEditingField(null);
                }}
                className="w-full px-3 py-2 text-base font-semibold border border-sky-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-sm font-semibold text-slate-500">{unit}</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commitEditor}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative w-full flex items-center justify-center bg-gradient-to-b from-slate-50/50 to-slate-100/40 select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWPORT_W} ${VIEWPORT_H}`}
          className={`w-full ${blueprintMode ? 'max-h-[380px]' : 'max-h-[520px]'} touch-none`}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            <pattern id="wallGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="0.75"
              />
            </pattern>
            <pattern id="stepHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="2" />
            </pattern>
            <pattern id="pegboardDots" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1" fill="#64748b" />
            </pattern>
          </defs>

          {viewMode === 'elevation' ? (
            <>
              {/* Floor & Wall Polygon */}
              <polygon
                points={buildWallPolygonPoints()}
                fill="url(#wallGrid)"
                stroke="#1e293b"
                strokeWidth="2.5"
              />

              {/* If Floor Step is active, highlight the raised step curb */}
              {space.hasFloorStep && space.stepWidthInches > 0 && space.stepHeightInches > 0 && (
                <g>
                  <rect
                    x={
                      space.stepSide === 'left'
                        ? toSvgX(0)
                        : toSvgX(space.widthInches - space.stepWidthInches)
                    }
                    y={toSvgY(space.stepHeightInches)}
                    width={space.stepWidthInches * scale}
                    height={space.stepHeightInches * scale}
                    fill="url(#stepHatch)"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  {/* Step Width Label */}
                  <g
                    onClick={() => openEditor('stepWidth', space.stepWidthInches)}
                    className={editableDimensions ? 'cursor-pointer group' : ''}
                  >
                    <rect
                      x={
                        (space.stepSide === 'left'
                          ? toSvgX(space.stepWidthInches / 2)
                          : toSvgX(space.widthInches - space.stepWidthInches / 2)) - 38
                      }
                      y={toSvgY(0) + 8}
                      width={76}
                      height={20}
                      rx={5}
                      fill="#f8fafc"
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                    <text
                      x={
                        space.stepSide === 'left'
                          ? toSvgX(space.stepWidthInches / 2)
                          : toSvgX(space.widthInches - space.stepWidthInches / 2)
                      }
                      y={toSvgY(0) + 22}
                      textAnchor="middle"
                      className="text-[10px] font-semibold fill-slate-700"
                    >
                      Step W: {formatLength(space.stepWidthInches, unit)}
                    </text>
                  </g>

                  {/* Step Height Label */}
                  <g
                    onClick={() => openEditor('stepHeight', space.stepHeightInches)}
                    className={editableDimensions ? 'cursor-pointer group' : ''}
                  >
                    <rect
                      x={
                        space.stepSide === 'left'
                          ? toSvgX(space.stepWidthInches) + 6
                          : toSvgX(space.widthInches - space.stepWidthInches) - 82
                      }
                      y={toSvgY(space.stepHeightInches / 2) - 10}
                      width={76}
                      height={20}
                      rx={5}
                      fill="#f8fafc"
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                    <text
                      x={
                        space.stepSide === 'left'
                          ? toSvgX(space.stepWidthInches) + 44
                          : toSvgX(space.widthInches - space.stepWidthInches) - 44
                      }
                      y={toSvgY(space.stepHeightInches / 2) + 4}
                      textAnchor="middle"
                      className="text-[10px] font-semibold fill-slate-700"
                    >
                      Step H: {formatLength(space.stepHeightInches, unit)}
                    </text>
                  </g>
                </g>
              )}

              {/* Skeleton Frame & Bays (Step 5, 6, 8) */}
              {skeleton && (
                <g>
                  {/* Bays Interactive Background Zones */}
                  {skeleton.bays.map((bay) => {
                    const bayX = toSvgX(bay.xStartInches);
                    const bayW = bay.widthInches * scale;
                    const bayTopY = toSvgY(bay.topTrackYInches);
                    const bayBottomY = toSvgY(bay.floorOffsetInches);
                    const isSelected = selectedBayIndex === bay.bayIndex;

                    return (
                      <g
                        key={`bay-${bay.bayIndex}`}
                        onClick={() => onSelectBay && onSelectBay(bay.bayIndex)}
                        className={onSelectBay ? 'cursor-pointer' : ''}
                      >
                        <rect
                          x={bayX}
                          y={bayTopY}
                          width={bayW}
                          height={Math.max(10, bayBottomY - bayTopY)}
                          fill={
                            isSelected
                              ? 'rgba(2, 132, 199, 0.10)'
                              : 'rgba(14, 165, 233, 0.03)'
                          }
                          stroke={isSelected ? '#0284c7' : '#94a3b8'}
                          strokeDasharray={isSelected ? 'none' : '4 4'}
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        {/* Bay Header Badge */}
                        <rect
                          x={bayX + bayW / 2 - 36}
                          y={bayTopY + 8}
                          width={72}
                          height={18}
                          rx={4}
                          fill={isSelected ? '#0284c7' : '#e2e8f0'}
                        />
                        <text
                          x={bayX + bayW / 2}
                          y={bayTopY + 20}
                          textAnchor="middle"
                          className={`text-[10px] font-bold ${
                            isSelected ? 'fill-white' : 'fill-slate-700'
                          }`}
                        >
                          Bay {bay.bayIndex + 1}: {formatLength(bay.widthInches, unit)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Top Track Bar(s) */}
                  {skeleton.bays.map((bay) => {
                    const x1 = toSvgX(bay.xStartInches);
                    const x2 = toSvgX(bay.xStartInches + bay.widthInches);
                    const trackY = toSvgY(bay.topTrackYInches);
                    return (
                      <rect
                        key={`track-${bay.bayIndex}`}
                        x={x1}
                        y={trackY - 4}
                        width={x2 - x1}
                        height={6}
                        fill="#334155"
                        rx={1}
                      />
                    );
                  })}

                  {/* Vertical Uprights / Standards */}
                  {skeleton.uprights.map((u) => {
                    const ux = toSvgX(u.xInches);
                    const uyTop = toSvgY(u.topYInches);
                    const uHeightPx = u.heightInches * scale;
                    return (
                      <g key={`upright-${u.uprightIndex}`}>
                        <rect
                          x={ux - 3}
                          y={uyTop}
                          width={6}
                          height={uHeightPx}
                          fill="#1e293b"
                          rx={1}
                        />
                        {/* Slot notch tick marks */}
                        {Array.from({
                          length: Math.floor(u.heightInches / Math.max(1.25, slotIntervalInches * 2)),
                        }).map((_, tickIdx) => {
                          const ty = uyTop + tickIdx * Math.max(1.25, slotIntervalInches * 2) * scale;
                          if (ty > uyTop + uHeightPx - 4) return null;
                          return (
                            <line
                              key={tickIdx}
                              x1={ux - 1.5}
                              y1={ty}
                              x2={ux + 1.5}
                              y2={ty}
                              stroke="#94a3b8"
                              strokeWidth="1"
                            />
                          );
                        })}
                        {/* Upright height label at bottom of upright */}
                        <text
                          x={ux}
                          y={uyTop + uHeightPx + 11}
                          textAnchor="middle"
                          className="text-[9px] font-semibold fill-slate-500"
                        >
                          {formatLength(u.heightInches, unit)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Placed Interior Components (Shelves, Baskets, Drawers, Rods, Pegboards) */}
                  {placedComponents.map((comp) => {
                    const bay = skeleton.bays.find((b) => b.bayIndex === comp.bayIndex);
                    if (!bay) return null;
                    const cx = toSvgX(bay.xStartInches) + 3;
                    const cw = Math.max(10, bay.widthInches * scale - 6);
                    const cyTop = toSvgY(comp.yFromFloorInches + comp.heightInches);
                    const ch = Math.max(6, comp.heightInches * scale);
                    const isDragging = draggingId === comp.id;

                    return (
                      <g
                        key={comp.id}
                        className={interactivePlacement ? 'cursor-ns-resize group' : ''}
                        onPointerDown={(e) => {
                          if (!interactivePlacement) return;
                          e.stopPropagation();
                          setDraggingId(comp.id);
                          if (onSelectBay) onSelectBay(comp.bayIndex);
                        }}
                      >
                        {/* Visual representation by role */}
                        {comp.role === 'shelf' && (
                          <rect
                            x={cx}
                            y={cyTop}
                            width={cw}
                            height={Math.max(6, ch)}
                            fill={
                              comp.subType === 'wire-shelf'
                                ? '#cbd5e1'
                                : comp.subType === 'metal-shelf'
                                ? '#64748b'
                                : '#d97706'
                            }
                            stroke={isDragging ? '#0284c7' : '#334155'}
                            strokeWidth={isDragging ? 2 : 1.2}
                            rx={1.5}
                          />
                        )}

                        {comp.role === 'drawer' && (
                          <g>
                            <rect
                              x={cx}
                              y={cyTop}
                              width={cw}
                              height={Math.max(16, ch)}
                              fill="#fed7aa"
                              stroke={isDragging ? '#0284c7' : '#9a3412'}
                              strokeWidth={isDragging ? 2 : 1.2}
                              rx={2}
                            />
                            {/* Drawer handle */}
                            <rect
                              x={cx + cw / 2 - 12}
                              y={cyTop + Math.max(16, ch) / 2 - 2}
                              width={24}
                              height={4}
                              rx={2}
                              fill="#7c2d12"
                            />
                          </g>
                        )}

                        {comp.role === 'basket' && (
                          <g>
                            <rect
                              x={cx}
                              y={cyTop}
                              width={cw}
                              height={Math.max(14, ch)}
                              fill="rgba(186, 230, 253, 0.55)"
                              stroke={isDragging ? '#0284c7' : '#0369a1'}
                              strokeDasharray="3 2"
                              strokeWidth={isDragging ? 2 : 1.5}
                              rx={2}
                            />
                          </g>
                        )}

                        {comp.role === 'rod' && (
                          <g>
                            <rect
                              x={cx}
                              y={cyTop + 2}
                              width={cw}
                              height={5}
                              rx={2.5}
                              fill="#0284c7"
                              stroke="#0369a1"
                              strokeWidth="1"
                            />
                          </g>
                        )}

                        {comp.role === 'pegboard' && (
                          <rect
                            x={cx}
                            y={cyTop}
                            width={cw}
                            height={Math.max(24, ch)}
                            fill="url(#pegboardDots)"
                            stroke={isDragging ? '#0284c7' : '#475569'}
                            strokeWidth="1.5"
                            rx={2}
                          />
                        )}

                        {/* Height label from floor */}
                        <text
                          x={cx + 6}
                          y={cyTop - 3}
                          className="text-[9px] font-bold fill-slate-700 pointer-events-none"
                        >
                          @{formatLength(comp.yFromFloorInches, unit)}
                        </text>

                        {/* Remove button on hover/active when in Step 6 */}
                        {interactivePlacement && onRemoveComponent && (
                          <g
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveComponent(comp.id);
                            }}
                            className="cursor-pointer opacity-85 hover:opacity-100"
                          >
                            <circle
                              cx={cx + cw - 10}
                              cy={cyTop + Math.max(6, ch) / 2}
                              r={8}
                              fill="#ef4444"
                            />
                            <text
                              x={cx + cw - 10}
                              y={cyTop + Math.max(6, ch) / 2 + 3.5}
                              textAnchor="middle"
                              className="text-[10px] font-bold fill-white"
                            >
                              ×
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Vertical Clearance Readouts between shelves in the active bay */}
                  {interactivePlacement &&
                    selectedBayIndex !== null &&
                    (() => {
                      const bayComps = placedComponents
                        .filter((c) => c.bayIndex === selectedBayIndex)
                        .sort((a, b) => a.yFromFloorInches - b.yFromFloorInches);
                      const bay = skeleton.bays.find((b) => b.bayIndex === selectedBayIndex);
                      if (!bay || bayComps.length < 2) return null;

                      const centerX = toSvgX(bay.xStartInches + bay.widthInches / 2);
                      return bayComps.slice(0, -1).map((lower, idx) => {
                        const upper = bayComps[idx + 1];
                        const gapInches =
                          upper.yFromFloorInches - (lower.yFromFloorInches + lower.heightInches);
                        if (gapInches <= 1) return null;
                        const yLowerTop = toSvgY(lower.yFromFloorInches + lower.heightInches);
                        const yUpperBottom = toSvgY(upper.yFromFloorInches);
                        const midY = (yLowerTop + yUpperBottom) / 2;

                        return (
                          <g key={`gap-${lower.id}-${upper.id}`} className="pointer-events-none">
                            <line
                              x1={centerX}
                              y1={yUpperBottom + 2}
                              x2={centerX}
                              y2={yLowerTop - 2}
                              stroke="#0284c7"
                              strokeDasharray="2 2"
                              strokeWidth="1.2"
                            />
                            <rect
                              x={centerX - 24}
                              y={midY - 8}
                              width={48}
                              height={15}
                              rx={4}
                              fill="#e0f2fe"
                              stroke="#38bdf8"
                              strokeWidth="1"
                            />
                            <text
                              x={centerX}
                              y={midY + 3}
                              textAnchor="middle"
                              className="text-[9px] font-bold fill-sky-900"
                            >
                              ↕ {formatLength(gapInches, unit)}
                            </text>
                          </g>
                        );
                      });
                    })()}
                </g>
              )}

              {/* Bottom Wall Width Dimension Line & Interactive Pill */}
              <g
                onClick={() => openEditor('width', space.widthInches)}
                className={editableDimensions ? 'cursor-pointer' : ''}
              >
                <line
                  x1={toSvgX(0)}
                  y1={originYBottom + 36}
                  x2={toSvgX(space.widthInches)}
                  y2={originYBottom + 36}
                  stroke="#0284c7"
                  strokeWidth="2"
                />
                <line
                  x1={toSvgX(0)}
                  y1={originYBottom + 30}
                  x2={toSvgX(0)}
                  y2={originYBottom + 42}
                  stroke="#0284c7"
                  strokeWidth="2"
                />
                <line
                  x1={toSvgX(space.widthInches)}
                  y1={originYBottom + 30}
                  x2={toSvgX(space.widthInches)}
                  y2={originYBottom + 42}
                  stroke="#0284c7"
                  strokeWidth="2"
                />
                <rect
                  x={toSvgX(space.widthInches / 2) - 58}
                  y={originYBottom + 24}
                  width={116}
                  height={24}
                  rx={6}
                  fill="#0284c7"
                />
                <text
                  x={toSvgX(space.widthInches / 2)}
                  y={originYBottom + 40}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white"
                >
                  Width: {formatLength(space.widthInches, unit)}
                </text>
              </g>

              {/* Left Wall Height Dimension Line & Interactive Pill */}
              <g
                onClick={() => openEditor('leftHeight', space.leftHeightInches)}
                className={editableDimensions ? 'cursor-pointer' : ''}
              >
                <line
                  x1={toSvgX(0) - 34}
                  y1={toSvgY(0)}
                  x2={toSvgX(0) - 34}
                  y2={toSvgY(space.leftHeightInches)}
                  stroke="#0284c7"
                  strokeWidth="2"
                />
                <rect
                  x={toSvgX(0) - 92}
                  y={toSvgY(space.leftHeightInches / 2) - 12}
                  width={84}
                  height={24}
                  rx={6}
                  fill="#0284c7"
                />
                <text
                  x={toSvgX(0) - 50}
                  y={toSvgY(space.leftHeightInches / 2) + 4}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white"
                >
                  {space.hasSlopedCeiling ? 'L: ' : 'H: '}
                  {formatLength(space.leftHeightInches, unit)}
                </text>
              </g>

              {/* Right Wall Height Pill (when sloped ceiling is active) */}
              {space.hasSlopedCeiling && (
                <g
                  onClick={() => openEditor('rightHeight', space.rightHeightInches)}
                  className={editableDimensions ? 'cursor-pointer' : ''}
                >
                  <line
                    x1={toSvgX(space.widthInches) + 34}
                    y1={toSvgY(0)}
                    x2={toSvgX(space.widthInches) + 34}
                    y2={toSvgY(space.rightHeightInches)}
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                  <rect
                    x={toSvgX(space.widthInches) + 8}
                    y={toSvgY(space.rightHeightInches / 2) - 12}
                    width={84}
                    height={24}
                    rx={6}
                    fill="#0284c7"
                  />
                  <text
                    x={toSvgX(space.widthInches) + 50}
                    y={toSvgY(space.rightHeightInches / 2) + 4}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white"
                  >
                    R: {formatLength(space.rightHeightInches, unit)}
                  </text>
                </g>
              )}
            </>
          ) : (
            /* TOP / PLAN VIEW */
            <>
              <rect
                x={originX}
                y={originYTop}
                width={drawnW}
                height={drawnH}
                fill="url(#wallGrid)"
                stroke="#334155"
                strokeWidth="2"
              />
              {/* Highlighted Target Storage Wall (Top Edge) */}
              <line
                x1={originX}
                y1={originYTop}
                x2={originX + drawnW}
                y2={originYTop}
                stroke="#0284c7"
                strokeWidth="6"
              />
              <text
                x={originX + drawnW / 2}
                y={originYTop - 14}
                textAnchor="middle"
                className="text-xs font-bold fill-sky-800"
              >
                TARGET MOUNTING WALL: "{space.wallName || 'Main Wall'}" (
                {formatLength(space.widthInches, unit)} W)
              </text>

              {/* Show top-down shelf depth footprint if skeleton is active */}
              {skeleton && (
                <rect
                  x={toSvgX(skeleton.bays[0]?.xStartInches || 0)}
                  y={originYTop + 3}
                  width={skeleton.totalCoveredWidthInches * scale}
                  height={Math.min(drawnH - 6, 16 * scale)}
                  fill="rgba(2, 132, 199, 0.22)"
                  stroke="#0284c7"
                  strokeDasharray="4 2"
                  strokeWidth="1.5"
                />
              )}

              {/* Room Depth Interactive Dimension Pill */}
              <g
                onClick={() => openEditor('depth', space.depthInches)}
                className={editableDimensions ? 'cursor-pointer' : ''}
              >
                <line
                  x1={originX + drawnW + 30}
                  y1={originYTop}
                  x2={originX + drawnW + 30}
                  y2={originYTop + drawnH}
                  stroke="#0284c7"
                  strokeWidth="2"
                />
                <rect
                  x={originX + drawnW + 8}
                  y={originYTop + drawnH / 2 - 12}
                  width={88}
                  height={24}
                  rx={6}
                  fill="#0284c7"
                />
                <text
                  x={originX + drawnW + 52}
                  y={originYTop + drawnH / 2 + 4}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white"
                >
                  Depth: {formatLength(space.depthInches, unit)}
                </text>
              </g>

              {/* Width Pill in Top View */}
              <g
                onClick={() => openEditor('width', space.widthInches)}
                className={editableDimensions ? 'cursor-pointer' : ''}
              >
                <rect
                  x={originX + drawnW / 2 - 58}
                  y={originYTop + drawnH + 16}
                  width={116}
                  height={24}
                  rx={6}
                  fill="#0284c7"
                />
                <text
                  x={originX + drawnW / 2}
                  y={originYTop + drawnH + 32}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white"
                >
                  Width: {formatLength(space.widthInches, unit)}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      {/* Bottom Helper Bar */}
      {!blueprintMode && editableDimensions && (
        <div className="px-4 py-2 bg-sky-50/70 border-t border-sky-100 text-xs text-sky-900 flex flex-wrap items-center justify-between gap-2">
          <span>
            💡 <strong>Tip:</strong> Tap or click any blue measurement badge directly on the drawing
            to type exact measurements.
          </span>
          <span className="text-sky-700 font-medium">
            Room Clearance Depth: {formatLength(space.depthInches, unit)}
          </span>
        </div>
      )}
    </div>
  );
};
