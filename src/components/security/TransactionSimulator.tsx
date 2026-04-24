// Mock imports for development
import { useState, useCallback, useEffect, FC } from '../../mocks/react-mock';
import { 
  Play, Pause, RotateCcw, CheckCircle, AlertTriangle, Clock, Zap 
} from '../../mocks/react-mock';
import { motion, AnimatePresence } from '../../mocks/react-mock';
import { useTransactionSecurity } from '../../hooks/useTransactionSecurity';

interface SimulationResult {
  success: boolean;
  executionTime: number;
  feeEstimate: number;
  balanceChanges: Array<{
    account: string;
    before: number;
    after: number;
    change: number;
  }>;
  warnings: string[];
  errors: string[];
  networkStatus: 'online' | 'offline' | 'congested';
}

interface TransactionSimulatorProps {
  transaction: any;
  onSimulationComplete?: (result: SimulationResult) => void;
}

export const TransactionSimulator: React.FC<TransactionSimulatorProps> = ({
  transaction,
  onSimulationComplete
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [autoSimulate, setAutoSimulate] = useState(false);
  
  const { simulateTransaction } = useTransactionSecurity();

  const runSimulation = useCallback(async () => {
    if (!transaction) return;
    
    setIsSimulating(true);
    setSimulationProgress(0);
    setSimulationResult(null);
    
    const startTime = performance.now();
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSimulationProgress(prev => Math.min(prev + 10, 90));
      }, 50);

      const result = await simulateTransaction(transaction);
      
      clearInterval(progressInterval);
      setSimulationProgress(100);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      const simulationData: SimulationResult = {
        success: result.success,
        executionTime,
        feeEstimate: result.feeEstimate || 0,
        balanceChanges: result.balanceChanges || [],
        warnings: result.warnings || [],
        errors: result.errors || [],
        networkStatus: result.networkStatus || 'online'
      };
      
      setSimulationResult(simulationData);
      onSimulationComplete?.(simulationData);
      
      // Ensure simulation completes under 500ms
      if (executionTime > 500) {
        console.warn(`Simulation took ${executionTime}ms, exceeding 500ms target`);
      }
      
    } catch (error) {
      setSimulationResult({
        success: false,
        executionTime: performance.now() - startTime,
        feeEstimate: 0,
        balanceChanges: [],
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        networkStatus: 'offline'
      });
    } finally {
      setIsSimulating(false);
      setTimeout(() => setSimulationProgress(0), 1000);
    }
  }, [transaction, simulateTransaction, onSimulationComplete]);

  const resetSimulation = useCallback(() => {
    setSimulationResult(null);
    setSimulationProgress(0);
    setAutoSimulate(false);
  }, []);

  // Auto-simulate when transaction changes
  useEffect(() => {
    if (transaction && autoSimulate && !isSimulating) {
      const timer = setTimeout(() => runSimulation(), 1000);
      return () => clearTimeout(timer);
    }
  }, [transaction, autoSimulate, runSimulation, isSimulating]);

  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'congested': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatExecutionTime = (time: number) => {
    return `${time.toFixed(2)}ms`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Transaction Simulator</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoSimulate}
              onChange={(e) => setAutoSimulate(e.target.checked)}
              className="rounded"
            />
            Auto-simulate
          </label>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={runSimulation}
          disabled={!transaction || isSimulating}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSimulating ? (
            <>
              <Pause className="w-4 h-4" />
              Simulating...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Simulation
            </>
          )}
        </button>
        
        <button
          onClick={resetSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>

        {simulationResult && (
          <div className="flex items-center gap-2 ml-auto">
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
              simulationResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {simulationResult.success ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {simulationResult.success ? 'Success' : 'Failed'}
            </div>
            <div className="text-sm text-gray-600">
              {formatExecutionTime(simulationResult.executionTime)}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Simulating transaction...</span>
              <span className="text-sm text-gray-600">{simulationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-purple-600 h-2 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${simulationProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulation Results */}
      <AnimatePresence>
        {simulationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Network Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Network Status</h3>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getNetworkStatusColor(simulationResult.networkStatus)}`}>
                  {simulationResult.networkStatus.charAt(0).toUpperCase() + simulationResult.networkStatus.slice(1)}
                </div>
                <div className="text-sm text-gray-600">
                  Fee Estimate: {simulationResult.feeEstimate} XLM
                </div>
              </div>
            </div>

            {/* Balance Changes */}
            {simulationResult.balanceChanges.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Balance Changes</h3>
                <div className="space-y-2">
                  {simulationResult.balanceChanges.map((change, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {change.account.slice(0, 8)}...{change.account.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {change.before} → {change.after} XLM
                        </p>
                      </div>
                      <div className={`text-sm font-medium ${
                        change.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {change.change >= 0 ? '+' : ''}{change.change} XLM
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {simulationResult.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-yellow-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Warnings
                </h3>
                <ul className="space-y-1">
                  {simulationResult.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-800">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Errors */}
            {simulationResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Errors
                </h3>
                <ul className="space-y-1">
                  {simulationResult.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-800">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Performance Metrics */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700">Execution Time</p>
                  <p className={`text-lg font-bold ${
                    simulationResult.executionTime <= 500 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {formatExecutionTime(simulationResult.executionTime)}
                  </p>
                  <p className="text-xs text-blue-600">
                    {simulationResult.executionTime <= 500 ? '✓ Under 500ms target' : '⚠ Exceeds 500ms target'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Simulation Status</p>
                  <p className={`text-lg font-bold ${
                    simulationResult.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {simulationResult.success ? 'Valid' : 'Invalid'}
                  </p>
                  <p className="text-xs text-blue-600">
                    Transaction {simulationResult.success ? 'can be executed' : 'will fail'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!simulationResult && !isSimulating && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Simulate</h3>
          <p className="text-gray-600 mb-4">
            Run a simulation to validate your transaction before execution
          </p>
          <button
            onClick={runSimulation}
            disabled={!transaction}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Start Simulation
          </button>
        </div>
      )}
    </div>
  );
};
