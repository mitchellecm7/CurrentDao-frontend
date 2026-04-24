/**
 * Represents the specific type of renewable energy source.
 */
export type EnergyType = 'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass';

/**
 * Quality tiers for energy sources, indicating reliability and infrastructure standards.
 */
export type QualityRating = 'premium' | 'standard' | 'basic';

/**
 * Recognized industry certifications for energy sustainability and environmental impact.
 */
export type Certification = 'green-e' | 'carbon-neutral' | 'leed' | 'iso-14001';

/**
 * Represents an individual energy source listing in the marketplace.
 */
export interface EnergySource {
  id: string;
  name: string;
  type: EnergyType;
  quality: QualityRating;
  certifications: Certification[];
  renewablePercentage: number;
  location: string;
  description: string;
  pricePerKwh: number;
}

/**
 * Criteria used to filter available energy sources.
 */
export interface EnergyFilters {
  types: EnergyType[];
  minRenewablePercentage: number;
  quality: QualityRating[];
  location: string;
  requiredCertifications: Certification[];
}