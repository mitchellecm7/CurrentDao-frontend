'use client';

import React, { useState, useCallback } from 'react';

type CostBasisMethod = 'FIFO' | 'LIFO' | 'HIFO';
type Jurisdiction = 'US' | 'UK' | 'EU' | 'AU' | 'CA';

interface Transaction {
  id: string;
  date: string;
  type: 'buy' | 'sell' | 'stake_reward' | 'governance_reward';
  asset: string;
  amount: number;
  priceUsd: number;
}

interface CapitalGainEntry {
  asset: string;
  acquiredDate: string;
  soldDate: string;
  proceeds: number;
  costBasis: number;
  gain: number;
  isLongTerm: boolean;
}

interface TaxSummary {
  shortTermGains: number;
  longTermGains: number;
  totalGains: number;
  totalIncome: number;
  incomeEvents: { date: string; description: string; amountUsd: number }[];
  capitalGains: CapitalGainEntry[];
}

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2024-01-15', type: 'buy', asset: 'ENERGY', amount: 1000, priceUsd: 0.50 },
  { id: '2', date: '2024-03-20', type: 'stake_reward', asset: 'ENERGY', amount: 50, priceUsd: 0.55 },
  { id: '3', date: '2024-06-10', type: 'sell', asset: 'ENERGY', amount: 500, priceUsd: 0.75 },
  { id: '4', date: '2024-08-05', type: 'governance_reward', asset: 'CDAO', amount: 10, priceUsd: 2.00 },
  { id: '5', date: '2024-11-01', type: 'sell', asset: 'ENERGY', amount: 300, priceUsd: 0.90 },
];

function calculateTaxSummary(
  transactions: Transaction[],
  taxYear: number,
  method: CostBasisMethod
): TaxSummary {
  const yearTxns = transactions.filter(t => new Date(t.date).getFullYear() === taxYear);
  const incomeEvents: TaxSummary['incomeEvents'] = [];
  const capitalGains: CapitalGainEntry[] = [];

  // Separate income events
  for (const t of yearTxns) {
    if (t.type === 'stake_reward' || t.type === 'governance_reward') {
      incomeEvents.push({
        date: t.date,
        description: t.type === 'stake_reward' ? `Staking reward: ${t.amount} ${t.asset}` : `Governance reward: ${t.amount} ${t.asset}`,
        amountUsd: t.amount * t.priceUsd,
      });
    }
  }

  // Build cost basis lots (all buys + income events as acquired lots)
  const lots: { date: string; asset: string; amount: number; costPerUnit: number }[] = [];
  for (const t of transactions.filter(tx => new Date(tx.date) <= new Date(`${taxYear}-12-31`))) {
    if (t.type === 'buy' || t.type === 'stake_reward' || t.type === 'governance_reward') {
      lots.push({ date: t.date, asset: t.asset, amount: t.amount, costPerUnit: t.priceUsd });
    }
  }

  // Sort lots by method
  const sortedLots = (asset: string) => {
    const assetLots = lots.filter(l => l.asset === asset && l.amount > 0);
    if (method === 'FIFO') return assetLots.sort((a, b) => a.date.localeCompare(b.date));
    if (method === 'LIFO') return assetLots.sort((a, b) => b.date.localeCompare(a.date));
    // HIFO: highest cost first
    return assetLots.sort((a, b) => b.costPerUnit - a.costPerUnit);
  };

  // Process sells in the tax year
  for (const t of yearTxns.filter(tx => tx.type === 'sell')) {
    let remaining = t.amount;
    const availableLots = sortedLots(t.asset);

    for (const lot of availableLots) {
      if (remaining <= 0) break;
      const used = Math.min(lot.amount, remaining);
      const proceeds = used * t.priceUsd;
      const costBasis = used * lot.costPerUnit;
      const acquiredDate = new Date(lot.date);
      const soldDate = new Date(t.date);
      const holdingDays = (soldDate.getTime() - acquiredDate.getTime()) / (1000 * 60 * 60 * 24);

      capitalGains.push({
        asset: t.asset,
        acquiredDate: lot.date,
        soldDate: t.date,
        proceeds,
        costBasis,
        gain: proceeds - costBasis,
        isLongTerm: holdingDays > 365,
      });

      lot.amount -= used;
      remaining -= used;
    }
  }

  const shortTermGains = capitalGains.filter(g => !g.isLongTerm).reduce((s, g) => s + g.gain, 0);
  const longTermGains = capitalGains.filter(g => g.isLongTerm).reduce((s, g) => s + g.gain, 0);
  const totalIncome = incomeEvents.reduce((s, e) => s + e.amountUsd, 0);

  return { shortTermGains, longTermGains, totalGains: shortTermGains + longTermGains, totalIncome, incomeEvents, capitalGains };
}

function exportCsv(summary: TaxSummary, taxYear: number) {
  const rows = [
    ['Type', 'Asset', 'Acquired Date', 'Sold/Received Date', 'Proceeds (USD)', 'Cost Basis (USD)', 'Gain/Loss (USD)', 'Term'],
    ...summary.capitalGains.map(g => [
      'Capital Gain/Loss', g.asset, g.acquiredDate, g.soldDate,
      g.proceeds.toFixed(2), g.costBasis.toFixed(2), g.gain.toFixed(2),
      g.isLongTerm ? 'Long-term' : 'Short-term',
    ]),
    ...summary.incomeEvents.map(e => [
      'Income', '', '', e.date, e.amountUsd.toFixed(2), '0.00', e.amountUsd.toFixed(2), 'Ordinary Income',
    ]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tax-report-${taxYear}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function TaxReportGenerator() {
  const currentYear = new Date().getFullYear();
  const [taxYear, setTaxYear] = useState(currentYear - 1);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('US');
  const [method, setMethod] = useState<CostBasisMethod>('FIFO');
  const [summary, setSummary] = useState<TaxSummary | null>(null);

  const generate = useCallback(() => {
    setSummary(calculateTaxSummary(SAMPLE_TRANSACTIONS, taxYear, method));
  }, [taxYear, method]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const fmtSign = (n: number) => (n >= 0 ? `+${fmt(n)}` : fmt(n));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tax Report Generator</h1>
        <p className="text-sm text-gray-500 mt-1">Generate capital gains & income summaries for your crypto transactions.</p>
      </div>

      {/* Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">Report Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Year</label>
            <select
              value={taxYear}
              onChange={e => setTaxYear(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
            >
              {[currentYear - 1, currentYear - 2, currentYear - 3].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jurisdiction</label>
            <select
              value={jurisdiction}
              onChange={e => setJurisdiction(e.target.value as Jurisdiction)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
            >
              {(['US', 'UK', 'EU', 'AU', 'CA'] as Jurisdiction[]).map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Basis Method</label>
            <select
              value={method}
              onChange={e => setMethod(e.target.value as CostBasisMethod)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
            >
              <option value="FIFO">FIFO (First In, First Out)</option>
              <option value="LIFO">LIFO (Last In, First Out)</option>
              <option value="HIFO">HIFO (Highest In, First Out)</option>
            </select>
          </div>
        </div>
        <button
          onClick={generate}
          className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Generate Report
        </button>
      </div>

      {summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Short-term Gains', value: fmtSign(summary.shortTermGains), color: summary.shortTermGains >= 0 ? 'text-green-600' : 'text-red-600' },
              { label: 'Long-term Gains', value: fmtSign(summary.longTermGains), color: summary.longTermGains >= 0 ? 'text-green-600' : 'text-red-600' },
              { label: 'Total Gains/Losses', value: fmtSign(summary.totalGains), color: summary.totalGains >= 0 ? 'text-green-600' : 'text-red-600' },
              { label: 'Ordinary Income', value: fmt(summary.totalIncome), color: 'text-blue-600' },
            ].map(card => (
              <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Capital Gains Table */}
          {summary.capitalGains.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Capital Gains / Losses</h2>
                <button
                  onClick={() => exportCsv(summary, taxYear)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Export CSV (TurboTax / Koinly)
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      {['Asset', 'Acquired', 'Sold', 'Proceeds', 'Cost Basis', 'Gain/Loss', 'Term'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {summary.capitalGains.map((g, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{g.asset}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{g.acquiredDate}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{g.soldDate}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{fmt(g.proceeds)}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{fmt(g.costBasis)}</td>
                        <td className={`px-4 py-3 font-medium ${g.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmtSign(g.gain)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${g.isLongTerm ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                            {g.isLongTerm ? 'Long-term' : 'Short-term'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Income Events */}
          {summary.incomeEvents.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-gray-200">Income Events (Staking & Governance Rewards)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      {['Date', 'Description', 'Amount (USD)'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {summary.incomeEvents.map((e, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{e.date}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{e.description}</td>
                        <td className="px-4 py-3 font-medium text-blue-600">{fmt(e.amountUsd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
            <strong>Disclaimer:</strong> This report is for informational purposes only. All calculations are performed client-side for your privacy. Please consult a qualified tax professional before filing. Tax laws vary by jurisdiction and change frequently.
          </div>
        </>
      )}
    </div>
  );
}
