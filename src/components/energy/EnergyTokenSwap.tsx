'use client';

import React, { useState, useCallback, useEffect } from 'react';

interface TokenInfo {
  symbol: string;
  name: string;
  price: number; // USD
  balance: number;
  icon: string;
}

const TOKENS: TokenInfo[] = [
  { symbol: 'ENERGY', name: 'Energy Token', price: 0.75, balance: 1000, icon: '⚡' },
  { symbol: 'SOLAR', name: 'Solar Credit', price: 1.20, balance: 500, icon: '☀️' },
  { symbol: 'WIND', name: 'Wind Credit', price: 0.95, balance: 300, icon: '💨' },
  { symbol: 'CDAO', name: 'CurrentDAO', price: 2.00, balance: 150, icon: '🏛️' },
  { symbol: 'XLM', name: 'Stellar Lumens', price: 0.12, balance: 5000, icon: '✦' },
];

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];

interface SwapRoute {
  path: string[];
  priceImpact: number;
  fee: number; // USD
  estimatedGas: number; // XLM
}

function getSwapRoute(from: string, to: string, amount: number): SwapRoute {
  // Simulate DEX routing (Stellar DEX / Soroban AMM)
  const direct = from !== 'XLM' && to !== 'XLM';
  const path = direct ? [from, 'XLM', to] : [from, to];
  const priceImpact = Math.min(amount * 0.0001, 5); // simulated
  return {
    path,
    priceImpact,
    fee: amount * 0.003, // 0.3% fee
    estimatedGas: 0.00001,
  };
}

function getOutputAmount(fromToken: TokenInfo, toToken: TokenInfo, inputAmount: number, slippage: number): number {
  if (!inputAmount || inputAmount <= 0) return 0;
  const rawOutput = (inputAmount * fromToken.price) / toToken.price;
  return rawOutput * (1 - slippage / 100);
}

// Minimal sparkline using SVG
function PriceSparkline({ symbol }: { symbol: string }) {
  // Deterministic pseudo-random price history
  const points = Array.from({ length: 20 }, (_, i) => {
    const seed = symbol.charCodeAt(0) + i;
    return 40 + ((seed * 7919) % 30);
  });
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 120, h = 32;
  const coords = points.map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / range) * h}`).join(' ');
  const trend = points[points.length - 1] > points[0];
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={coords} fill="none" stroke={trend ? '#22c55e' : '#ef4444'} strokeWidth="1.5" />
    </svg>
  );
}

export function EnergyTokenSwap() {
  const [fromSymbol, setFromSymbol] = useState('ENERGY');
  const [toSymbol, setToSymbol] = useState('XLM');
  const [inputAmount, setInputAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const fromToken = TOKENS.find(t => t.symbol === fromSymbol)!;
  const toToken = TOKENS.find(t => t.symbol === toSymbol)!;
  const parsedInput = parseFloat(inputAmount) || 0;
  const outputAmount = getOutputAmount(fromToken, toToken, parsedInput, slippage);
  const route = parsedInput > 0 ? getSwapRoute(fromSymbol, toSymbol, parsedInput) : null;
  const insufficientBalance = parsedInput > fromToken.balance;
  const effectiveSlippage = customSlippage ? parseFloat(customSlippage) : slippage;

  const handleFlip = useCallback(() => {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
    setInputAmount('');
    setTxHash(null);
  }, [fromSymbol, toSymbol]);

  const handleSwap = useCallback(async () => {
    setSwapping(true);
    setShowConfirm(false);
    // Simulate Stellar DEX / Soroban AMM transaction
    await new Promise(r => setTimeout(r, 1500));
    setTxHash('0x' + Math.random().toString(16).slice(2, 18));
    setSwapping(false);
    setInputAmount('');
  }, []);

  const canSwap = parsedInput > 0 && !insufficientBalance && fromSymbol !== toSymbol;

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Swap Energy Tokens</h1>
        <button
          onClick={() => setShowSettings(s => !s)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label="Swap settings"
        >
          ⚙️
        </button>
      </div>

      {/* Slippage settings */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Slippage Tolerance</p>
          <div className="flex items-center gap-2">
            {SLIPPAGE_PRESETS.map(s => (
              <button
                key={s}
                onClick={() => { setSlippage(s); setCustomSlippage(''); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${slippage === s && !customSlippage ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                {s}%
              </button>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={customSlippage}
                onChange={e => setCustomSlippage(e.target.value)}
                placeholder="Custom"
                min="0.01"
                max="50"
                className="w-20 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
          {effectiveSlippage > 5 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">⚠️ High slippage tolerance. Your transaction may be frontrun.</p>
          )}
        </div>
      )}

      {/* Swap card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
        {/* From */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">From</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Balance: {fromToken.balance.toLocaleString()} {fromToken.symbol}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={fromSymbol}
              onChange={e => { setFromSymbol(e.target.value); setInputAmount(''); }}
              className="flex-shrink-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              {TOKENS.filter(t => t.symbol !== toSymbol).map(t => (
                <option key={t.symbol} value={t.symbol}>{t.icon} {t.symbol}</option>
              ))}
            </select>
            <input
              type="number"
              value={inputAmount}
              onChange={e => setInputAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              className="flex-1 bg-transparent text-right text-xl font-semibold text-gray-900 dark:text-white outline-none placeholder-gray-400"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{fromToken.name}</span>
            <div className="flex items-center gap-2">
              {parsedInput > 0 && (
                <span className="text-xs text-gray-400">≈ ${(parsedInput * fromToken.price).toFixed(2)}</span>
              )}
              <button
                onClick={() => setInputAmount(String(fromToken.balance))}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* Flip button */}
        <div className="flex justify-center">
          <button
            onClick={handleFlip}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
            aria-label="Flip tokens"
          >
            ⇅
          </button>
        </div>

        {/* To */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">To (estimated)</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Balance: {toToken.balance.toLocaleString()} {toToken.symbol}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={toSymbol}
              onChange={e => setToSymbol(e.target.value)}
              className="flex-shrink-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              {TOKENS.filter(t => t.symbol !== fromSymbol).map(t => (
                <option key={t.symbol} value={t.symbol}>{t.icon} {t.symbol}</option>
              ))}
            </select>
            <span className="flex-1 text-right text-xl font-semibold text-gray-900 dark:text-white">
              {outputAmount > 0 ? outputAmount.toFixed(4) : '0.00'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{toToken.name}</span>
            {outputAmount > 0 && (
              <span className="text-xs text-gray-400">≈ ${(outputAmount * toToken.price).toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Price impact & route */}
        {route && parsedInput > 0 && (
          <div className="space-y-1.5 px-1 pt-1">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Price</span>
              <span>1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(4)} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Price Impact</span>
              <span className={route.priceImpact > 3 ? 'text-red-500 font-medium' : route.priceImpact > 1 ? 'text-amber-500' : 'text-green-600'}>
                {route.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Fee (0.3%)</span>
              <span>${route.fee.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Network Fee</span>
              <span>{route.estimatedGas} XLM</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Route</span>
              <span className="font-mono">{route.path.join(' → ')}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Min. received ({effectiveSlippage}% slippage)</span>
              <span>{(outputAmount * (1 - effectiveSlippage / 100)).toFixed(4)} {toToken.symbol}</span>
            </div>
          </div>
        )}

        {/* Swap button */}
        <button
          onClick={() => canSwap && setShowConfirm(true)}
          disabled={!canSwap || swapping}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors mt-2 ${
            insufficientBalance
              ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 cursor-not-allowed'
              : !canSwap
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {swapping ? 'Swapping…' : insufficientBalance ? `Insufficient ${fromToken.symbol}` : !parsedInput ? 'Enter an amount' : fromSymbol === toSymbol ? 'Select different tokens' : 'Swap'}
        </button>
      </div>

      {/* Price history sparkline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{fromToken.symbol}/{toToken.symbol} price history (7d)</p>
        <PriceSparkline symbol={fromSymbol + toSymbol} />
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Swap</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">You pay</span>
                <span className="font-medium text-gray-900 dark:text-white">{parsedInput} {fromToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">You receive (min.)</span>
                <span className="font-medium text-gray-900 dark:text-white">{(outputAmount * (1 - effectiveSlippage / 100)).toFixed(4)} {toToken.symbol}</span>
              </div>
              {route && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price impact</span>
                    <span className={route.priceImpact > 3 ? 'text-red-500 font-medium' : 'text-gray-900 dark:text-white'}>{route.priceImpact.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fee</span>
                    <span className="text-gray-900 dark:text-white">${route.fee.toFixed(4)} + {route.estimatedGas} XLM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Route</span>
                    <span className="font-mono text-xs text-gray-900 dark:text-white">{route.path.join(' → ')}</span>
                  </div>
                </>
              )}
            </div>
            {route && route.priceImpact > 3 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 text-xs text-red-700 dark:text-red-400">
                ⚠️ High price impact! This swap will significantly move the market price.
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSwap}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                Confirm Swap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {txHash && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 text-sm">
          <p className="font-medium text-green-800 dark:text-green-400">✓ Swap successful!</p>
          <p className="text-green-700 dark:text-green-500 text-xs mt-1 font-mono break-all">Tx: {txHash}</p>
        </div>
      )}
    </div>
  );
}
