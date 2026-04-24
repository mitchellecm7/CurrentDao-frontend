import { Sun, Wind, Droplets, Flame, Leaf } from 'lucide-react';
import type { EnergyType } from '@/types/energy';

interface EnergyIconProps {
  type: EnergyType;
  className?: string;
}

export function EnergyIcon({ type, className = "w-6 h-6" }: EnergyIconProps) {
  switch (type) {
    case 'solar': return <Sun className={`text-yellow-500 ${className}`} aria-label="Solar Energy" />;
    case 'wind': return <Wind className={`text-sky-400 ${className}`} aria-label="Wind Energy" />;
    case 'hydro': return <Droplets className={`text-blue-600 ${className}`} aria-label="Hydro Energy" />;
    case 'geothermal': return <Flame className={`text-orange-500 ${className}`} aria-label="Geothermal Energy" />;
    case 'biomass': return <Leaf className={`text-green-500 ${className}`} aria-label="Biomass Energy" />;
    default: return <Sun className={className} />;
  }
}