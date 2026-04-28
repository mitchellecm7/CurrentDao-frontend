export interface HeatmapDataPoint {
  hour: number; // 0-23
  day: number; // 0-6 (Sunday = 0)
  value: number; // kWh consumption
  timestamp?: Date;
}

export interface HeatmapData {
  week: HeatmapDataPoint[];
  metadata: {
    startDate: Date;
    endDate: Date;
    totalConsumption: number;
    averageConsumption: number;
    peakConsumption: number;
    peakHour: number;
    peakDay: number;
  };
}

export type HeatmapViewType = 'personal' | 'community' | 'grid';

export interface HeatmapConfig {
  viewType: HeatmapViewType;
  dateRange: {
    start: Date;
    end: Date;
  };
  colorScheme: 'blue' | 'green' | 'orange' | 'purple';
  showLabels: boolean;
  showGrid: boolean;
  animationEnabled: boolean;
}

export interface HeatmapTooltipData {
  hour: number;
  day: string;
  value: number;
  formattedValue: string;
  percentage: number;
  timestamp?: Date;
}

export interface HeatmapExportOptions {
  format: 'png' | 'csv' | 'json';
  filename?: string;
  includeMetadata?: boolean;
}

export interface HeatmapColorScale {
  min: number;
  max: number;
  colors: string[];
  thresholds: number[];
}

export interface HeatmapInteractionState {
  hoveredCell: {
    hour: number;
    day: number;
  } | null;
  selectedCell: {
    hour: number;
    day: number;
  } | null;
  isDragging: boolean;
}
