'use client';

import { useState, useMemo } from 'react';
import type { EnergyType, EnergySource, EnergyFilters } from '@/types/energy';

const MOCK_SOURCES: EnergySource[] = [
  {
    id: 'es-1',
    name: 'Sahara Solar Array',
    type: 'solar',
    quality: 'premium',
    certifications: ['green-e', 'carbon-neutral'],
    renewablePercentage: 100,
    location: 'North Africa',
    description: 'High-efficiency monocrystalline panels situated in optimal sun-exposure zones. Generates pure baseline renewable energy.',
    pricePerKwh: 0.045
  },
  {
    id: 'es-2',
    name: 'North Sea Wind Farm',
    type: 'wind',
    quality: 'standard',
    certifications: ['iso-14001'],
    renewablePercentage: 100,
    location: 'Europe',
    description: 'Offshore wind turbine network offering consistent yield during night cycles.',
    pricePerKwh: 0.052
  },
  {
    id: 'es-3',
    name: 'Valley Geothermal',
    type: 'geothermal',
    quality: 'premium',
    certifications: ['green-e', 'leed'],
    renewablePercentage: 100,
    location: 'Iceland',
    description: '24/7 stable output derived from volcanic thermal vents. Negligible surface footprint.',
    pricePerKwh: 0.061
  },
  {
    id: 'es-4',
    name: 'River Bend Hydro',
    type: 'hydro',
    quality: 'basic',
    certifications: [],
    renewablePercentage: 95,
    location: 'South America',
    description: 'Established run-of-the-river hydroelectric plant. Reliable and cost-effective.',
    pricePerKwh: 0.038
  },
  {
    id: 'es-5',
    name: 'Eco Biomass Co.',
    type: 'biomass',
    quality: 'standard',
    certifications: ['carbon-neutral'],
    renewablePercentage: 80,
    location: 'North America',
    description: 'Sustainable agricultural waste processing facility capturing methane for grid power.',
    pricePerKwh: 0.055
  }
];

/**
 * Custom hook to manage energy source filtering and comparison state.
 * 
 * @returns Methods and state for interacting with energy source data, applying filters, and managing the comparison tool.
 */
export function useEnergyTypes() {
  const [filters, setFilters] = useState<EnergyFilters>({
    types: [],
    minRenewablePercentage: 0,
    quality: [],
    location: '',
    requiredCertifications: []
  });

  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  /**
   * Toggles the selection state of a specific energy type filter.
   * 
   * @param type - The energy type to toggle (e.g., 'solar', 'wind').
   */
  const handleToggleType = (type: EnergyType) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  /**
   * Memoized array of energy sources that match the currently applied filters.
   */
  const filteredSources = useMemo(() => {
    return MOCK_SOURCES.filter(source => {
      if (filters.types.length > 0 && !filters.types.includes(source.type)) return false;
      if (source.renewablePercentage < filters.minRenewablePercentage) return false;
      if (filters.quality.length > 0 && !filters.quality.includes(source.quality)) return false;
      if (filters.location && !source.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.requiredCertifications.length > 0) {
        const hasAll = filters.requiredCertifications.every(c => source.certifications.includes(c));
        if (!hasAll) return false;
      }
      return true;
    });
  }, [filters]);

  /**
   * Memoized array of energy sources specifically selected for side-by-side comparison.
   */
  const comparisonSources = useMemo(() => {
    return MOCK_SOURCES.filter(s => comparisonIds.includes(s.id));
  }, [comparisonIds]);

  /**
   * Adds an energy source to the comparison view.
   * 
   * @param id - The unique identifier of the energy source to add.
   */
  const addToComparison = (id: string) => {
    if (!comparisonIds.includes(id)) {
      setComparisonIds(prev => [...prev, id]);
    }
  };

  /**
   * Removes an energy source from the comparison view.
   * 
   * @param id - The unique identifier of the energy source to remove.
   */
  const removeFromComparison = (id: string) => {
    setComparisonIds(prev => prev.filter(compId => compId !== id));
  };

  return {
    filters,
    setFilters,
    handleToggleType,
    filteredSources,
    comparisonSources,
    addToComparison,
    removeFromComparison,
    allSources: MOCK_SOURCES
  };
}