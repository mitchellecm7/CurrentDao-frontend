import { format, addDays, addHours, startOfWeek, endOfWeek } from 'date-fns';
import { HeatmapData, HeatmapDataPoint } from '../types/heatmap';

export const generateMockHeatmapData = (startDate: Date, viewType: 'personal' | 'community' | 'grid' = 'personal'): HeatmapData => {
  const weekData: HeatmapDataPoint[] = [];
  const startOfWeekDate = startOfWeek(startDate, { weekStartsOn: 0 }); // Sunday
  
  // Generate data for each day of the week (0-6) and each hour (0-23)
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = addHours(addDays(startOfWeekDate, day), hour);
      
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
  
  return {
    week: weekData,
    metadata: {
      startDate: startOfWeekDate,
      endDate: endOfWeek(startDate, { weekStartsOn: 0 }),
      totalConsumption: Math.round(totalConsumption * 100) / 100,
      averageConsumption: Math.round(averageConsumption * 100) / 100,
      peakConsumption: Math.round(peakConsumption * 100) / 100,
      peakHour: peakPoint?.hour || 0,
      peakDay: peakPoint?.day || 0,
    },
  };
};

export const aggregateHeatmapData = (data: HeatmapData[], aggregationType: 'average' | 'sum' | 'max' = 'average'): HeatmapData => {
  if (data.length === 0) {
    return generateMockHeatmapData(new Date());
  }
  
  const aggregatedWeek: HeatmapDataPoint[] = [];
  
  // Initialize aggregated data structure
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      aggregatedWeek.push({
        day,
        hour,
        value: 0,
        timestamp: new Date(),
      });
    }
  }
  
  // Aggregate values
  data.forEach(weekData => {
    weekData.week.forEach(dataPoint => {
      const index = dataPoint.day * 24 + dataPoint.hour;
      if (aggregationType === 'sum') {
        aggregatedWeek[index].value += dataPoint.value;
      } else if (aggregationType === 'average') {
        aggregatedWeek[index].value += dataPoint.value;
      } else if (aggregationType === 'max') {
        aggregatedWeek[index].value = Math.max(aggregatedWeek[index].value, dataPoint.value);
      }
    });
  });
  
  // Finalize average calculation
  if (aggregationType === 'average') {
    aggregatedWeek.forEach(point => {
      point.value = point.value / data.length;
    });
  }
  
  // Calculate metadata
  const values = aggregatedWeek.map(point => point.value);
  const totalConsumption = values.reduce((sum, val) => sum + val, 0);
  const averageConsumption = totalConsumption / values.length;
  const peakConsumption = Math.max(...values);
  const peakPoint = aggregatedWeek.find(point => point.value === peakConsumption);
  
  return {
    week: aggregatedWeek,
    metadata: {
      startDate: new Date(Math.min(...data.map(d => d.metadata.startDate.getTime()))),
      endDate: new Date(Math.max(...data.map(d => d.metadata.endDate.getTime()))),
      totalConsumption: Math.round(totalConsumption * 100) / 100,
      averageConsumption: Math.round(averageConsumption * 100) / 100,
      peakConsumption: Math.round(peakConsumption * 100) / 100,
      peakHour: peakPoint?.hour || 0,
      peakDay: peakPoint?.day || 0,
    },
  };
};

export const filterHeatmapDataByDateRange = (
  data: HeatmapData, 
  startDate: Date, 
  endDate: Date
): HeatmapData => {
  const filteredWeek = data.week.filter(point => {
    if (!point.timestamp) return true;
    return point.timestamp >= startDate && point.timestamp <= endDate;
  });
  
  // Recalculate metadata
  const values = filteredWeek.map(point => point.value);
  const totalConsumption = values.reduce((sum, val) => sum + val, 0);
  const averageConsumption = values.length > 0 ? totalConsumption / values.length : 0;
  const peakConsumption = values.length > 0 ? Math.max(...values) : 0;
  const peakPoint = filteredWeek.find(point => point.value === peakConsumption);
  
  return {
    week: filteredWeek,
    metadata: {
      startDate,
      endDate,
      totalConsumption: Math.round(totalConsumption * 100) / 100,
      averageConsumption: Math.round(averageConsumption * 100) / 100,
      peakConsumption: Math.round(peakConsumption * 100) / 100,
      peakHour: peakPoint?.hour || 0,
      peakDay: peakPoint?.day || 0,
    },
  };
};

export const calculateHeatmapStatistics = (data: HeatmapData) => {
  const values = data.week.map(point => point.value);
  
  // Sort values for percentile calculations
  const sortedValues = [...values].sort((a, b) => a - b);
  const n = sortedValues.length;
  
  const getPercentile = (p: number) => {
    const index = Math.ceil((p / 100) * n) - 1;
    return sortedValues[Math.max(0, Math.min(index, n - 1))];
  };
  
  // Calculate standard deviation
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Peak hours analysis
  const hourlyAverages = Array.from({ length: 24 }, (_, hour) => {
    const hourValues = data.week.filter(point => point.hour === hour).map(point => point.value);
    return {
      hour,
      average: hourValues.reduce((sum, val) => sum + val, 0) / hourValues.length,
      total: hourValues.reduce((sum, val) => sum + val, 0),
    };
  }).sort((a, b) => b.average - a.average);
  
  // Daily analysis
  const dailyTotals = Array.from({ length: 7 }, (_, day) => {
    const dayValues = data.week.filter(point => point.day === day).map(point => point.value);
    return {
      day,
      total: dayValues.reduce((sum, val) => sum + val, 0),
      average: dayValues.reduce((sum, val) => sum + val, 0) / dayValues.length,
    };
  });
  
  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(getPercentile(50) * 100) / 100,
    standardDeviation: Math.round(standardDeviation * 100) / 100,
    min: Math.round(Math.min(...values) * 100) / 100,
    max: Math.round(Math.max(...values) * 100) / 100,
    p25: Math.round(getPercentile(25) * 100) / 100,
    p75: Math.round(getPercentile(75) * 100) / 100,
    p90: Math.round(getPercentile(90) * 100) / 100,
    p95: Math.round(getPercentile(95) * 100) / 100,
    peakHours: hourlyAverages.slice(0, 3),
    dailyBreakdown: dailyTotals,
    totalDataPoints: values.length,
  };
};

export const exportHeatmapToCSV = (data: HeatmapData, filename: string = 'heatmap-data.csv') => {
  const headers = ['Day', 'Hour', 'Consumption (kWh)', 'Timestamp'];
  const rows = data.week.map(point => [
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][point.day],
    point.hour,
    point.value.toFixed(2),
    point.timestamp ? format(point.timestamp, 'yyyy-MM-dd HH:mm:ss') : '',
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

export const exportHeatmapToJSON = (data: HeatmapData, filename: string = 'heatmap-data.json') => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
