import React, { useMemo } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { BaseChart } from '../charts/BaseChart';
import { LineChart as LineChartComponent } from '../charts/LineChart';
import { DrawdownAnalysis } from '../../types/portfolio';

interface DrawdownBenchmarkComparisonProps {
  drawdownAnalysis: DrawdownAnalysis;
}

interface BenchmarkData {
  name: string;
  symbol: string;
  data: Array<{ timestamp: Date; value: number; drawdown: number }>;
  color: string;
}

export const DrawdownBenchmarkComparison: React.FC<DrawdownBenchmarkComparisonProps> = ({
  drawdownAnalysis
}) => {
  const benchmarkData = useMemo<BenchmarkData[]>(() => {
    // Generate mock benchmark data for comparison
    const btcData = generateBenchmarkData('Bitcoin', 'BTC', '#f7931a', 0.8);
    const energyData = generateBenchmarkData('Energy Index', 'ENRG', '#00d4aa', 0.6);
    
    return [btcData, energyData];
  }, []);

  const comparisonChartData = useMemo(() => {
    const portfolioData = drawdownAnalysis.timeSeries.map(point => ({
      x: point.timestamp,
      y: point.drawdownPercentage,
      label: 'Portfolio'
    }));

    const datasets = [
      { name: 'Portfolio', data: portfolioData, color: '#3b82f6' }
    ];

    benchmarkData.forEach(benchmark => {
      const benchmarkChartData = benchmark.data.map(point => ({
        x: point.timestamp,
        y: point.drawdown,
        label: benchmark.name
      }));
      datasets.push({ name: benchmark.name, data: benchmarkChartData, color: benchmark.color });
    });

    return datasets;
  }, [drawdownAnalysis.timeSeries, benchmarkData]);

  const comparisonMetrics = useMemo(() => {
    return benchmarkData.map(benchmark => {
      const maxDrawdown = Math.max(...benchmark.data.map(d => d.drawdown));
      const currentDrawdown = benchmark.data[benchmark.data.length - 1]?.drawdown || 0;
      
      return {
        name: benchmark.name,
        symbol: benchmark.symbol,
        color: benchmark.color,
        maxDrawdown,
        currentDrawdown,
        relativePerformance: drawdownAnalysis.currentDrawdown - currentDrawdown
      };
    });
  }, [benchmarkData, drawdownAnalysis.currentDrawdown]);

  function generateBenchmarkData(name: string, symbol: string, color: string, volatility: number): BenchmarkData {
    const data: Array<{ timestamp: Date; value: number; drawdown: number }> = [];
    const now = new Date();
    let currentValue = 100;
    let peakValue = 100;

    for (let i = 365; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      
      // Simulate market movements with benchmark-specific volatility
      const dailyReturn = (Math.random() - 0.5) * volatility * 0.02;
      currentValue = currentValue * (1 + dailyReturn);
      
      if (currentValue > peakValue) {
        peakValue = currentValue;
      }
      
      const drawdown = ((peakValue - currentValue) / peakValue) * 100;
      
      data.push({
        timestamp: date,
        value: currentValue,
        drawdown
      });
    }

    return { name, symbol, data, color };
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return 'text-red-400';
    if (value < 0) return 'text-green-400';
    return 'text-gray-400';
  };

  const getPerformanceBg = (value: number) => {
    if (value > 0) return 'bg-red-500/10 border-red-500/20';
    if (value < 0) return 'bg-green-500/10 border-green-500/20';
    return 'bg-gray-500/10 border-gray-500/20';
  };

  return (
    <div className="space-y-8">
      {/* Comparison Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-3">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Portfolio DD
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {formatPercentage(drawdownAnalysis.currentDrawdown)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Max: {formatPercentage(drawdownAnalysis.maxDrawdown)}
          </div>
        </div>

        {comparisonMetrics.map((benchmark) => (
          <div 
            key={benchmark.symbol} 
            className={`bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl ${getPerformanceBg(benchmark.relativePerformance)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: benchmark.color }} />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {benchmark.symbol}
              </span>
            </div>
            <div className="text-2xl font-black text-white">
              {formatPercentage(benchmark.currentDrawdown)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Max: {formatPercentage(benchmark.maxDrawdown)}
            </div>
            <div className={`text-xs font-bold mt-2 ${getPerformanceColor(benchmark.relativePerformance)}`}>
              {benchmark.relativePerformance > 0 ? '+' : ''}{formatPercentage(benchmark.relativePerformance)} vs Portfolio
            </div>
          </div>
        ))}
      </div>

      {/* Drawdown Comparison Chart */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400">
            Drawdown Comparison
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Portfolio vs Benchmark Performance
          </p>
        </div>
        <div className="p-6">
          <BaseChart
            title=""
            height={400}
            showControls={true}
          >
            <LineChartComponent
              data={comparisonChartData}
              height={400}
              strokeWidth={2}
              showGrid={true}
              showXAxis={true}
              showYAxis={true}
              showLegend={true}
              theme={{
                backgroundColor: 'transparent',
                gridColor: 'rgba(255, 255, 255, 0.05)',
                textColor: 'rgba(255, 255, 255, 0.5)',
                colors: ['#3b82f6', '#f7931a', '#00d4aa']
              }}
            />
          </BaseChart>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
        <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-6">
          Performance Summary
        </h3>
        <div className="space-y-4">
          {comparisonMetrics.map((benchmark) => {
            const isOutperforming = benchmark.relativePerformance < 0;
            return (
              <div key={benchmark.symbol} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: benchmark.color }} />
                  <div>
                    <div className="font-bold text-white">{benchmark.name}</div>
                    <div className="text-xs text-gray-500">{benchmark.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${isOutperforming ? 'text-green-400' : 'text-red-400'}`}>
                    {isOutperforming ? 'Outperforming' : 'Underperforming'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {benchmark.relativePerformance > 0 ? '+' : ''}{formatPercentage(benchmark.relativePerformance)} difference
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
