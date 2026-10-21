import { MeasurementUnit } from '../types/builder';

const INCH_TO_CM = 2.54;

export function inchesToUnit(inches: number, unit: MeasurementUnit): number {
  if (unit === 'cm') {
    return Number((inches * INCH_TO_CM).toFixed(1));
  }
  return Number(inches.toFixed(2));
}

export function unitToInches(value: number, unit: MeasurementUnit): number {
  if (unit === 'cm') {
    return Number((value / INCH_TO_CM).toFixed(3));
  }
  return Number(value.toFixed(3));
}

export function formatLength(inches: number, unit: MeasurementUnit, showUnit = true): string {
  const val = inchesToUnit(inches, unit);
  const clean = Number.isInteger(val) ? val.toString() : val.toFixed(unit === 'cm' ? 1 : 2).replace(/\.?0+$/, '');
  if (!showUnit) return clean;
  return unit === 'cm' ? `${clean} cm` : `${clean}"`;
}

export function formatDimensions(
  dims: { width: number; depth: number; height: number },
  unit: MeasurementUnit
): string {
  const w = formatLength(dims.width, unit, false);
  const d = formatLength(dims.depth, unit, false);
  const h = formatLength(dims.height, unit, false);
  const suffix = unit === 'cm' ? 'cm' : 'in';
  return `${w}W × ${d}D × ${h}H ${suffix}`;
}
