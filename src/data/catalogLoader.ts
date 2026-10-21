import elfaClassic from '../../data/catalog/elfa-classic.json';
import elfaDecorGarage from '../../data/catalog/elfa-decor-garage.json';
import ikeaBoaxel from '../../data/catalog/ikea-boaxel.json';
import ikeaPax from '../../data/catalog/ikea-pax.json';
import ikeaBror from '../../data/catalog/ikea-bror.json';
import hardwareRetailers from '../../data/catalog/hardware-retailers.json';
import { CatalogSystem } from '../types/builder';

/**
 * Loads all standardized JSON catalog files from `/data/catalog/*.json`.
 * When BuilderMiner drops new or updated JSON files into `/data/catalog/`,
 * they follow this exact schema.
 */
export const CATALOG_SYSTEMS: CatalogSystem[] = [
  elfaDecorGarage as CatalogSystem,
  elfaClassic as CatalogSystem,
  ikeaBoaxel as CatalogSystem,
  rubbermaidOrHardware(hardwareRetailers as CatalogSystem),
  ikeaBror as CatalogSystem,
  ikeaPax as CatalogSystem,
];

function rubbermaidOrHardware(sys: CatalogSystem): CatalogSystem {
  return sys;
}

export function getSystemById(systemId: string | null): CatalogSystem | undefined {
  if (!systemId) return undefined;
  return CATALOG_SYSTEMS.find((s) => s.systemId === systemId);
}
