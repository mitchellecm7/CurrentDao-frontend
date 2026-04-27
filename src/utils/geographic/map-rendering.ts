import { Coordinates } from '../../types/maps';

export class MapRenderingUtils {
  // Simple Mercator projection for SVG mapping
  public static project(coords: Coordinates, width: number, height: number): { x: number; y: number } {
    const x = (coords.lng + 180) * (width / 360);
    const latRad = (coords.lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = height / 2 - (width * mercN) / (2 * Math.PI);
    return { x, y };
  }

  public static createFlowPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    return `M${from.x},${from.y}A${dr},${dr} 0 0,1 ${to.x},${to.y}`;
  }

  public static getHeatmapColor(intensity: number): string {
    const colors = [
      'rgba(59, 130, 246, 0.2)', // Low
      'rgba(34, 197, 94, 0.4)',  // Medium-Low
      'rgba(234, 179, 8, 0.6)',  // Medium-High
      'rgba(239, 68, 68, 0.8)'   // High
    ];
    const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
    return colors[index];
  }
}
