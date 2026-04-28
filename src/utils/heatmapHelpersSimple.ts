// Simplified heatmap data generation without external dependencies

export interface HeatmapDataPoint {
  hour: number;
  day: number;
  value: number;
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

export const generateMockHeatmapData = (startDate: Date, viewType: 'personal' | 'community' | 'grid' = 'personal'): HeatmapData => {
  const weekData: HeatmapDataPoint[] = [];
  
  // Get start of week (Sunday)
  const startOfWeekDate = new Date(startDate);
  const dayOfWeek = startOfWeekDate.getDay();
  startOfWeekDate.setDate(startOfWeekDate.getDate() - dayOfWeek);
  
  // Generate data for each day of the week (0-6) and each hour (0-23)
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(startOfWeekDate);
      timestamp.setDate(startOfWeekDate.getDate() + day);
      timestamp.setHours(hour);
      
      // Simulate different consumption patterns based on viewType
      let baseConsumption = 0;
      
      if (viewType === 'personal') {
        // Personal usage: higher in morning (6-9) and evening (18-22), lower at night
        if ((hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 22)) {
          baseConsumption = 2.5 + Math.random() * 1.5; // 2.5-4.0 kWh
        } else if (hour >= 0 && hour <= 5) {
          baseConsumption = 0.3 + Math.random() * 0.4; // 0.3-0.7 kWh
        } else {
          baseConsumption = 1.0 + Math.random() * 1.0; // 1.0-2.0 kWh
        }
        
        // Weekend patterns (Saturday=5, Sunday=6)
        if (day >= 5) {
          if (hour >= 10 && hour <= 23) {
            baseConsumption *= 1.3; // Higher weekend usage
          } else {
            baseConsumption *= 0.8; // Lower weekend morning usage
          }
        }
      } else if (viewType === 'community') {
        // Community usage: more stable, with business hours peak
        if (hour >= 8 && hour <= 18) {
          baseConsumption = 15 + Math.random() * 10; // 15-25 kWh
        } else if (hour >= 19 && hour <= 23) {
          baseConsumption = 8 + Math.random() * 6; // 8-14 kWh
        } else {
          baseConsumption = 3 + Math.random() * 4; // 3-7 kWh
        }
        
        // Lower weekend community usage
        if (day >= 5) {
          baseConsumption *= 0.6;
        }
      } else if (viewType === 'grid') {
        // Grid usage: large scale, industrial patterns
        if (hour >= 6 && hour <= 22) {
          baseConsumption = 50 + Math.random() * 30; // 50-80 kWh
        } else {
          baseConsumption = 20 + Math.random() * 15; // 20-35 kWh
        }
        
        // Industrial patterns - less weekend variation
        if (day >= 5) {
          baseConsumption *= 0.85;
        }
      }
      
      // Add some random variation
      const randomVariation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const finalConsumption = Math.max(0.1, baseConsumption * (1 + randomVariation));
      
      weekData.push({
        day,
        hour,
        value: Math.round(finalConsumption * 100) / 100, // Round to 2 decimal places
        timestamp,
      });
    }
  }
  
  const values = weekData.map(point => point.value);
  const totalConsumption = values.reduce((sum, val) => sum + val, 0);
  const averageConsumption = totalConsumption / values.length;
  const peakConsumption = Math.max(...values);
  const peakPoint = weekData.find(point => point.value === peakConsumption);
  
  // Calculate end of week
  const endOfWeekDate = new Date(startOfWeekDate);
  endOfWeekDate.setDate(startOfWeekDate.getDate() + 6);
  
  return {
    week: weekData,
    metadata: {
      startDate: startOfWeekDate,
      endDate: endOfWeekDate,
      totalConsumption: Math.round(totalConsumption * 100) / 100,
      averageConsumption: Math.round(averageConsumption * 100) / 100,
      peakConsumption: Math.round(peakConsumption * 100) / 100,
      peakHour: peakPoint?.hour || 0,
      peakDay: peakPoint?.day || 0,
    },
  };
};

export const exportHeatmapToCSV = (data: HeatmapData, filename: string = 'heatmap-data.csv') => {
  const headers = ['Day', 'Hour', 'Consumption (kWh)', 'Timestamp'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const rows = data.week.map(point => [
    dayNames[point.day],
    point.hour,
    point.value.toFixed(2),
    point.timestamp ? point.timestamp.toISOString() : '',
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const formatChartValue = (value: number, type: 'currency' | 'percentage' | 'number' | 'energy' = 'number'): string => {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'energy':
      return `${value.toFixed(2)} kWh`;
    default:
      return value.toLocaleString();
  }
};

export const formatChartDate = (date: Date, formatStr: string = 'MMM dd, yyyy'): string => {
  // Simple date formatting without date-fns
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
};
