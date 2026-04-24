// Mock imports for development
import { useState, useCallback, FC } from '../../mocks/react-mock';
import { 
  Shield, Users, Plus, X, Check, AlertTriangle, Clock 
} from '../../mocks/react-mock';
import { motion, AnimatePresence } from '../../mocks/react-mock';
import { useMultiSigBuilder } from '../../hooks/useTransactionSecurity';

interface Signer {
  id: string;
  publicKey: string;
  weight: number;
  name?: string;
  status: 'pending' | 'signed' | 'rejected';
}

interface MultiSigBuilderProps {
  onTransactionBuilt?: (transaction: any) => void;
  maxSigners?: number;
}

export const MultiSigBuilder: React.FC<MultiSigBuilderProps> = ({
  onTransactionBuilt,
  maxSigners = 10
}) => {
  const [signers, setSigners] = useState<Signer[]>([]);
  const [threshold, setThreshold] = useState(2);
  const [isBuilding, setIsBuilding] = useState(false);
  const [builderStep, setBuilderStep] = useState<'setup' | 'signing' | 'complete'>('setup');
  
  const { buildMultiSigTransaction, validateSigners } = useMultiSigBuilder();

  const addSigner = useCallback(() => {
    if (signers.length >= maxSigners) return;
    
    const newSigner: Signer = {
      id: `signer-${Date.now()}`,
      publicKey: '',
      weight: 1,
      status: 'pending'
    };
    
    setSigners(prev => [...prev, newSigner]);
  }, [signers.length, maxSigners]);

  const removeSigner = useCallback((id: string) => {
    setSigners(prev => prev.filter(signer => signer.id !== id));
  }, []);

  const updateSigner = useCallback((id: string, updates: Partial<Signer>) => {
    setSigners(prev => prev.map(signer => 
      signer.id === id ? { ...signer, ...updates } : signer
    ));
  }, []);

  const getTotalWeight = useCallback(() => {
    return signers.reduce((sum, signer) => sum + signer.weight, 0);
  }, [signers]);

  const canBuildTransaction = useCallback(() => {
    const validSigners = signers.filter(s => s.publicKey && s.publicKey.length > 0);
    return validSigners.length >= 2 && threshold <= getTotalWeight() && threshold > 0;
  }, [signers, threshold, getTotalWeight]);

  const handleBuildTransaction = useCallback(async () => {
    if (!canBuildTransaction()) return;
    
    setIsBuilding(true);
    try {
      const validSigners = signers.filter(s => s.publicKey && s.publicKey.length > 0);
      const isValid = await validateSigners(validSigners);
      
      if (!isValid) {
        throw new Error('Invalid signers detected');
      }

      const transaction = await buildMultiSigTransaction({
        signers: validSigners,
        threshold,
        sourceAccount: validSigners[0].publicKey
      });

      setBuilderStep('signing');
      onTransactionBuilt?.(transaction);
    } catch (error) {
      console.error('Failed to build multi-sig transaction:', error);
    } finally {
      setIsBuilding(false);
    }
  }, [signers, threshold, canBuildTransaction, validateSigners, buildMultiSigTransaction, onTransactionBuilt]);

  const simulateSignature = useCallback((signerId: string) => {
    setSigners(prev => prev.map(signer => 
      signer.id === signerId 
        ? { ...signer, status: Math.random() > 0.2 ? 'signed' : 'rejected' }
        : signer
    ));
  }, []);

  const allSigned = signers.every(s => s.status === 'signed');
  const signedCount = signers.filter(s => s.status === 'signed').length;
  const signedWeight = signers.filter(s => s.status === 'signed').reduce((sum, s) => sum + s.weight, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Multi-Signature Transaction Builder</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          {signers.length}/{maxSigners} Signers
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['setup', 'signing', 'complete'].map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              builderStep === step ? 'bg-blue-600 text-white' :
              ['setup', 'signing'].includes(builderStep) && index <= 1 ? 'bg-green-600 text-white' :
              'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            <span className={`ml-2 text-sm ${
              builderStep === step ? 'text-blue-600 font-medium' : 'text-gray-600'
            }`}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </span>
            {index < 2 && <div className={`flex-1 h-1 mx-4 ${
              ['setup', 'signing'].includes(builderStep) && index === 0 ? 'bg-green-600' :
              builderStep === 'complete' && index === 1 ? 'bg-green-600' : 'bg-gray-200'
            }`} />}
          </div>
        ))}
      </div>

      {builderStep === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Threshold Setting */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signature Threshold: {threshold}
            </label>
            <input
              type="range"
              min="1"
              max={getTotalWeight() || 2}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
              disabled={getTotalWeight() === 0}
            />
            <p className="text-xs text-gray-500 mt-1">
              Require signatures totaling at least {threshold} weight
            </p>
          </div>

          {/* Signers List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Signers</h3>
              <button
                onClick={addSigner}
                disabled={signers.length >= maxSigners}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Signer
              </button>
            </div>

            <AnimatePresence>
              {signers.map((signer, index) => (
                <motion.div
                  key={signer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        signer.status === 'signed' ? 'bg-green-100 text-green-600' :
                        signer.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {signer.status === 'signed' ? <Check className="w-4 h-4" /> :
                         signer.status === 'rejected' ? <X className="w-4 h-4" /> :
                         index + 1}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Signer name (optional)"
                          value={signer.name || ''}
                          onChange={(e) => updateSigner(signer.id, { name: e.target.value })}
                          className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeSigner(signer.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Public Key
                      </label>
                      <input
                        type="text"
                        placeholder="G..."
                        value={signer.publicKey}
                        onChange={(e) => updateSigner(signer.id, { publicKey: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Weight: {signer.weight}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={signer.weight}
                        onChange={(e) => updateSigner(signer.id, { weight: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Build Transaction Button */}
          <div className="flex justify-end">
            <button
              onClick={handleBuildTransaction}
              disabled={!canBuildTransaction() || isBuilding}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isBuilding ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Building Transaction...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Build Multi-Sig Transaction
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {builderStep === 'signing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Transaction Ready for Signatures</h3>
            <p className="text-sm text-blue-700 mb-4">
              Collect signatures from {threshold} weight threshold. Current: {signedWeight}/{threshold}
            </p>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((signedWeight / threshold) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {signers.map(signer => (
              <div key={signer.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      signer.status === 'signed' ? 'bg-green-100 text-green-600' :
                      signer.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {signer.status === 'signed' ? <Check className="w-4 h-4" /> :
                       signer.status === 'rejected' ? <X className="w-4 h-4" /> :
                       <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{signer.name || `Signer ${signer.id.slice(-4)}`}</p>
                      <p className="text-sm text-gray-500">Weight: {signer.weight}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => simulateSignature(signer.id)}
                    disabled={signer.status !== 'pending'}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {signer.status === 'pending' ? 'Simulate Signature' : signer.status}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {signedWeight >= threshold && (
            <div className="flex justify-center">
              <button
                onClick={() => setBuilderStep('complete')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Complete Transaction
              </button>
            </div>
          )}
        </motion.div>
      )}

      {builderStep === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Signature Transaction Complete</h3>
          <p className="text-gray-600 mb-4">
            All {signedCount} signatures collected with total weight of {signedWeight}
          </p>
          <button
            onClick={() => {
              setBuilderStep('setup');
              setSigners([]);
              setThreshold(2);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Build New Transaction
          </button>
        </motion.div>
      )}
    </div>
  );
};
