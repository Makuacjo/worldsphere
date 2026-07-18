import { animalData } from './animals';
import { plantData } from './plants';
import { waterData } from './waters';
import type { WildlifeEntry } from '../types/wildlife';

// Export the individual arrays so you can use them on category pages
export { animalData, plantData, waterData };

// Create and export the combined array for Search and SpeciesDetail
export const allWildlife: WildlifeEntry[] = [
  ...animalData,
  ...plantData,
  ...waterData
];