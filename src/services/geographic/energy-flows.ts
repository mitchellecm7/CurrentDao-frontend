import { Coordinates } from '../../types/maps';

export interface EnergyFlow {
  id: string;
  from: Coordinates;
  to: Coordinates;
  volume: number; // MWh
  type: 'solar' | 'wind' | 'hydro' | 'nuclear' | 'gas' | 'coal';
  status: 'active' | 'scheduled' | 'interrupted';
  timestamp: number;
}

export class EnergyFlowService {
  public static async getGlobalFlows(): Promise<EnergyFlow[]> {
    // Mock global flows
    return [
      { id: 'f1', from: { lat: 34.0522, lng: -118.2437 }, to: { lat: 37.7749, lng: -122.4194 }, volume: 450, type: 'solar', status: 'active', timestamp: Date.now() },
      { id: 'f2', from: { lat: 51.5074, lng: -0.1278 }, to: { lat: 48.8566, lng: 2.3522 }, volume: 1200, type: 'wind', status: 'active', timestamp: Date.now() },
      { id: 'f3', from: { lat: 35.6762, lng: 139.6503 }, to: { lat: 31.2304, lng: 121.4737 }, volume: 800, type: 'nuclear', status: 'active', timestamp: Date.now() },
      { id: 'f4', from: { lat: -33.8688, lng: 151.2093 }, to: { lat: -37.8136, lng: 144.9631 }, volume: 300, type: 'solar', status: 'active', timestamp: Date.now() },
    ];
  }

  public static getFlowIntensity(flow: EnergyFlow): number {
    return Math.min(flow.volume / 1000, 1);
  }
}
