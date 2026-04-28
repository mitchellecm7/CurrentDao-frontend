import React, { useMemo } from 'react';
import { AlertTriangle, Clock, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import { DrawdownAnalysis } from '../../types/portfolio';
import { BaseChart } from '../charts/BaseChart';
import { AreaChart } from '../charts/AreaChart';

interface DrawdownAnalysisProps {
  drawdownAnalysis: DrawdownAnalysis;
  portfolioValue: number;
}

export const DrawdownAnalysisComponent: React.FC<DrawdownAnalysisProps> = ({
  drawdownAnalysis,
  portfolioValue
}) => {
  const worstDrawdowns = useMemo(() => {
    return [...drawdownAnalysis.drawdownPeriods]
      .sort((a, b) => b.drawdownPercentage - a.drawdownPercentage)
      .slice(0, 10);
  }, [drawdownAnalysis.drawdownPeriods]);

  const underwaterChartData = useMemo(() => {
    return drawdownAnalysis.timeSeries.map(point => ({
      x: point.timestamp,
      y: point.drawdownPercentage,
      label: `${point.drawdownPercentage.toFixed(2)}%`
    }));
  }, [drawdownAnalysis.timeSeries]);

  const recoveryChartData = useMemo(() => {
    return drawdownAnalysis.drawdownPeriods.map((period, index) => ({
      x: period.startDate,
      y: period.duration,
      label: `${period.duration} days`
    }));
  }, [drawdownAnalysis.drawdownPeriods]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDrawdownColor = (percentage: number) => {
    if (percentage < 5) return 'text-green-400';
    if (percentage < 10) return 'text-yellow-400';
    if (percentage < 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getDrawdownBgColor = (percentage: number) => {
    if (percentage < 5) return 'bg-green-500/10 border-green-500/20';
    if (percentage < 10) return 'bg-yellow-500/10 border-yellow-500/20';
    if (percentage < 20) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-8">
      {/* Current Drawdown Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl ${getDrawdownBgColor(drawdownAnalysis.currentDrawdown)}`}>
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-5 h-5 text-gray-400" />
            <span className={`text-xs font-bold uppercase tracking-widest ${getDrawdownColor(drawdownAnalysis.currentDrawdown)}`}>
              Current DD
            </span>
          </div>
          <div className={`text-2xl font-black ${getDrawdownColor(drawdownAnalysis.currentDrawdown)}`}>
            {drawdownAnalysis.currentDrawdown.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatCurrency(drawdownAnalysis.currentDrawdownDollar)}
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-3">
            <Activity className="w-5 h-5 text-gray-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Max DD
            </span>
          </div>
          <div className="text-2xl font-black text-red-400">
            {drawdownAnalysis.maxDrawdown.toFixed(2)}%
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {formatCurrency(drawdownAnalysis.maxDrawdownDollar)}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {formatDate(drawdownAnalysis.maxDrawdownDate)}
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Underwater Days
            </span>
          </div>
          <div className="text-2xl font-black text-blue-400">
            {drawdownAnalysis.underwaterDays}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Total: {drawdownAnalysis.drawdownPeriods.length} periods
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-3">
            <RefreshCw className="w-5 h-5 text-gray-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Recovery Time
            </span>
          </div>
          <div className="text-2xl font-black text-green-400">
            {drawdownAnalysis.recoveryDays}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Average: {drawdownAnalysis.drawdownPeriods.length > 0 ? 
              Math.round(drawdownAnalysis.recoveryDays / drawdownAnalysis.drawdownPeriods.filter(p => p.recovered).length) : 0} days
          </div>
        </div>
      </div>

      {/* Drawdown Alerts */}
      {drawdownAnalysis.alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-bold uppercase tracking-widest text-xs text-red-400">
              Drawdown Alerts
            </h3>
          </div>
          <div className="space-y-2">
            {drawdownAnalysis.alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                <div>
                  <span className="text-red-400 font-bold">
                    {alert.currentValue.toFixed(2)}%
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    exceeds {alert.threshold}% threshold
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(alert.triggeredAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Underwater Equity Curve */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400">
            Underwater Equity Curve
          </h3>
        </div>
        <div className="p-6">
          <BaseChart
            title=""
            height={300}
            showControls={false}
          >
            <AreaChart
              data={[{ name: 'Drawdown', data: underwaterChartData }]}
              height={300}
              showArea={true}
              gradient={true}
              strokeWidth={2}
              showGrid={true}
              showXAxis={true}
              showYAxis={true}
              theme={{
                backgroundColor: 'transparent',
                gridColor: 'rgba(255, 255, 255, 0.05)',
                textColor: 'rgba(255, 255, 255, 0.5)',
                colors: ['#ef4444']
              }}
            />
          </BaseChart>
        </div>
      </div>

      {/* Historical Drawdowns Table */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold uppercase tracking-widest text-xs text-gray-400">
            Top 10 Worst Drawdowns
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Rank</th>
                <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Period</th>
                <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Drawdown</th>
                <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Amount</th>
                <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Duration</th>
                <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Recovery</th>
                <th className="text-center p-4 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {worstDrawdowns.map((period, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm font-bold text-gray-300">#{index + 1}</td>
                  <td className="p-4 text-sm text-gray-400">
                    <div>
                      <div>{formatDate(period.startDate)}</div>
                      {period.endDate && <div className="text-xs text-gray-600">{formatDate(period.endDate)}</div>}
                    </div>
                  </td>
                  <td className={`p-4 text-sm font-bold text-right ${getDrawdownColor(period.drawdownPercentage)}`}>
                    {period.drawdownPercentage.toFixed(2)}%
                  </td>
                  <td className="p-4 text-sm text-gray-400 text-right">
                    {formatCurrency(period.drawdownAmount)}
                  </td>
                  <td className="p-4 text-sm text-gray-400 text-right">
                    {period.duration} days
                  </td>
                  <td className="p-4 text-sm text-gray-400 text-right">
                    {period.recovered ? `${period.recoveryTime} days` : '-'}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      period.recovered 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {period.recovered ? 'Recovered' : 'Underwater'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {worstDrawdowns.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No drawdown periods recorded
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
