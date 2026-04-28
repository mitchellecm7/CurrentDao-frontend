import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOrderBook } from '@/hooks/useOrderBook';
import { useMarketDepth } from '@/hooks/useMarketDepth';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { TrendingUpIcon, TrendingDownIcon, AlertTriangleIcon, ActivityIcon, Volume2Icon, BarChart3Icon } from 'lucide-react';

interface OrderFlowImbalanceProps {
  symbol?: string;
  alertThreshold?: number;
  showHistoricalOverlay?: boolean;
  showPerAssetBreakdown?: boolean;
  className?: string;
}

interface ImbalanceData {
  timestamp: number;
  time: string;
  buyVolume: number;
  sellVolume: number;
  netImbalance: number;
  buyPressure: number;
  sellPressure: number;
  cumulativeDelta: number;
  price: number;
}

interface AlertData {
  id: string;
  timestamp: number;
  message: string;
  severity: 'low' | 'medium' | 'high';
  imbalanceValue: number;
}

interface AssetBreakdown {
  symbol: string;
  buyVolume: number;
  sellVolume: number;
  imbalance: number;
  pressureRatio: number;
}

export function OrderFlowImbalance({
  symbol = 'BTC/USD',
  alertThreshold = 70,
  showHistoricalOverlay = true,
  showPerAssetBreakdown = true,
  className = ''
}: OrderFlowImbalanceProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '4h' | '1d'>('1h');
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isAlertActive, setIsAlertActive] = useState(false);

  const { orderBook, isConnected } = useOrderBook({ symbol });
  const { orderFlowMetrics, liquidityMetrics } = useMarketDepth({ orderBook });

  const [historicalData, setHistoricalData] = useState<ImbalanceData[]>([]);

  const timeframeMap = {
    '1h': 3600000,
    '4h': 14400000,
    '1d': 86400000
  };

  const currentWindow = timeframeMap[selectedTimeframe];

  const generateMockData = useCallback((): ImbalanceData => {
    const baseBuyVolume = 1000 + Math.random() * 500;
    const baseSellVolume = 900 + Math.random() * 600;
    const netImbalance = baseBuyVolume - baseSellVolume;
    
    return {
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      buyVolume: baseBuyVolume,
      sellVolume: baseSellVolume,
      netImbalance,
      buyPressure: baseBuyVolume / (baseBuyVolume + baseSellVolume) * 100,
      sellPressure: baseSellVolume / (baseBuyVolume + baseSellVolume) * 100,
      cumulativeDelta: netImbalance,
      price: 50000 + (Math.random() - 0.5) * 1000
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateMockData();
      setHistoricalData(prev => {
        const updated = [newData, ...prev.slice(0, 3599)]; // Keep 1 hour of 1-second data
        return updated;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [generateMockData]);

  const recentData = useMemo(() => {
    const now = Date.now();
    return historicalData.filter(data => now - data.timestamp <= currentWindow);
  }, [historicalData, currentWindow]);

  const currentImbalance = useMemo(() => {
    if (!recentData.length) return 0;
    const latest = recentData[0];
    return Math.abs(latest.buyPressure - latest.sellPressure);
  }, [recentData]);

  const cumulativeDeltaData = useMemo(() => {
    let cumulativeDelta = 0;
    return recentData.slice().reverse().map(data => {
      cumulativeDelta += data.netImbalance;
      return {
        ...data,
        cumulativeDelta
      };
    });
  }, [recentData]);

  const assetBreakdown = useMemo((): AssetBreakdown[] => [
    {
      symbol: 'BTC/USD',
      buyVolume: recentData.reduce((sum, d) => sum + d.buyVolume, 0),
      sellVolume: recentData.reduce((sum, d) => sum + d.sellVolume, 0),
      imbalance: currentImbalance,
      pressureRatio: recentData[0]?.buyPressure / (recentData[0]?.sellPressure || 1) || 1
    },
    {
      symbol: 'ETH/USD',
      buyVolume: Math.random() * 5000 + 2000,
      sellVolume: Math.random() * 4500 + 1800,
      imbalance: Math.random() * 30 + 5,
      pressureRatio: Math.random() * 2 + 0.5
    },
    {
      symbol: 'SOL/USD',
      buyVolume: Math.random() * 3000 + 1000,
      sellVolume: Math.random() * 2800 + 900,
      imbalance: Math.random() * 25 + 3,
      pressureRatio: Math.random() * 1.8 + 0.7
    }
  ], [recentData, currentImbalance]);

  useEffect(() => {
    if (currentImbalance > alertThreshold && !isAlertActive) {
      const newAlert: AlertData = {
        id: `alert_${Date.now()}`,
        timestamp: Date.now(),
        message: `Order flow imbalance exceeded threshold: ${currentImbalance.toFixed(1)}%`,
        severity: currentImbalance > 85 ? 'high' : currentImbalance > 75 ? 'medium' : 'low',
        imbalanceValue: currentImbalance
      };
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
      setIsAlertActive(true);
      
      setTimeout(() => setIsAlertActive(false), 5000);
    }
  }, [currentImbalance, alertThreshold, isAlertActive]);

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(2);
  };

  const getPressureColor = (pressure: number) => {
    if (pressure > 60) return '#10B981'; // green
    if (pressure < 40) return '#EF4444'; // red
    return '#F59E0B'; // yellow
  };

  const getImbalanceColor = (imbalance: number) => {
    if (imbalance > alertThreshold) return '#EF4444';
    if (imbalance > alertThreshold * 0.7) return '#F59E0B';
    return '#10B981';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
          <p className="text-white font-medium">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatVolume(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderVolumeBarChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={recentData.slice(0, 60)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={formatVolume} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="buyVolume" fill="#10B981" name="Buy Volume" />
        <Bar dataKey="sellVolume" fill="#EF4444" name="Sell Volume" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderCumulativeDeltaChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={cumulativeDeltaData.slice(0, 120)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={formatVolume} />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="cumulativeDelta" 
          stroke="#3B82F6" 
          strokeWidth={2}
          dot={false}
          name="Cumulative Delta"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPressureIndicator = () => {
    const latest = recentData[0];
    if (!latest) return null;

    return (
      <div className="flex items-center justify-center p-4">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-gray-700"></div>
          <div 
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: `conic-gradient(
                from 0deg,
                ${getPressureColor(latest.buyPressure)} 0deg,
                ${getPressureColor(latest.buyPressure)} ${latest.buyPressure * 3.6}deg,
                #374151 ${latest.buyPressure * 3.6}deg,
                #374151 360deg
              )`
            }}
          ></div>
          <div className="absolute inset-2 rounded-full bg-gray-800 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{currentImbalance.toFixed(1)}%</span>
            <span className="text-xs text-gray-400">Imbalance</span>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoricalOverlay = () => (
    <ResponsiveContainer width="100%" height={150}>
      <ComposedChart data={cumulativeDeltaData.slice(0, 180)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="time" 
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          yAxisId="price"
          orientation="right"
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <YAxis 
          yAxisId="delta"
          orientation="left"
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          tickFormatter={formatVolume}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          yAxisId="delta"
          type="monotone" 
          dataKey="cumulativeDelta" 
          fill="#3B82F6" 
          fillOpacity={0.3}
          stroke="#3B82F6"
          name="Delta"
        />
        <Line 
          yAxisId="price"
          type="monotone" 
          dataKey="price" 
          stroke="#F59E0B" 
          strokeWidth={2}
          dot={false}
          name="Price"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderPerAssetBreakdown = () => (
    <div className="space-y-3">
      {assetBreakdown.map(asset => (
        <div key={asset.symbol} className="bg-gray-750 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">{asset.symbol}</span>
            <span 
              className={`text-sm font-medium ${
                asset.imbalance > alertThreshold ? 'text-red-400' : 
                asset.imbalance > alertThreshold * 0.7 ? 'text-yellow-400' : 'text-green-400'
              }`}
            >
              {asset.imbalance.toFixed(1)}%
            </span>
          </div>
          <div className="flex space-x-2 mb-2">
            <div className="flex-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-2 transition-all duration-300"
                style={{ width: `${(asset.buyVolume / (asset.buyVolume + asset.sellVolume)) * 100}%` }}
              ></div>
            </div>
            <div className="flex-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="bg-red-500 h-2 transition-all duration-300"
                style={{ width: `${(asset.sellVolume / (asset.buyVolume + asset.sellVolume)) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Buy: {formatVolume(asset.buyVolume)}</span>
            <span>Sell: {formatVolume(asset.sellVolume)}</span>
            <span>Ratio: {asset.pressureRatio.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">Order Flow Imbalance</h2>
            <span className="text-gray-400">{symbol}</span>
            <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              <span className="text-xs">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
          
          {isAlertActive && (
            <div className="flex items-center space-x-2 text-red-400 animate-pulse">
              <AlertTriangleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Alert Active</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 mt-3">
          <div className="flex space-x-2">
            {(['1h', '4h', '1d'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedTimeframe === timeframe 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Real-time Volume</h3>
            {renderVolumeBarChart()}
          </div>
          
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Pressure Indicator</h3>
            {renderPressureIndicator()}
          </div>
          
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Current Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Buy Pressure:</span>
                <span className="text-xs text-green-400 font-medium">
                  {recentData[0]?.buyPressure.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Sell Pressure:</span>
                <span className="text-xs text-red-400 font-medium">
                  {recentData[0]?.sellPressure.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Net Flow:</span>
                <span className={`text-xs font-medium ${
                  recentData[0]?.netImbalance > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatVolume(recentData[0]?.netImbalance || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Imbalance:</span>
                <span 
                  className="text-xs font-medium"
                  style={{ color: getImbalanceColor(currentImbalance) }}
                >
                  {currentImbalance.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Cumulative Delta ({selectedTimeframe})</h3>
        {renderCumulativeDeltaChart()}
      </div>

      {showHistoricalOverlay && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Historical Imbalance Overlay</h3>
          {renderHistoricalOverlay()}
        </div>
      )}

      {showPerAssetBreakdown && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Per-Asset Breakdown</h3>
          {renderPerAssetBreakdown()}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Recent Alerts</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {alerts.slice(0, 5).map(alert => (
              <div 
                key={alert.id}
                className={`p-2 rounded text-xs ${
                  alert.severity === 'high' ? 'bg-red-900 bg-opacity-30 text-red-300' :
                  alert.severity === 'medium' ? 'bg-yellow-900 bg-opacity-30 text-yellow-300' :
                  'bg-blue-900 bg-opacity-30 text-blue-300'
                }`}
              >
                <div className="flex justify-between">
                  <span>{alert.message}</span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900 p-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>Update Rate: 1 second</div>
          <div>Data Points: {recentData.length}</div>
          <div>Threshold: {alertThreshold}%</div>
          <div>Time Window: {selectedTimeframe}</div>
        </div>
      </div>
    </div>
  );
}
