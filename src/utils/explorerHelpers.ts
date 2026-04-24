import { Transaction, TransactionFilter, NetworkStats, ExportOptions } from '@/types/explorer'
import { format } from 'date-fns'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const filterTransactions = (transactions: Transaction[], filter: TransactionFilter): Transaction[] => {
  return transactions.filter(transaction => {
    // Date range filter
    if (filter.dateRange) {
      const txDate = new Date(transaction.timestamp)
      if (txDate < filter.dateRange.start || txDate > filter.dateRange.end) {
        return false
      }
    }

    // Amount range filter
    if (filter.amountRange) {
      const amount = parseFloat(transaction.amount)
      if (amount < filter.amountRange.min || amount > filter.amountRange.max) {
        return false
      }
    }

    // Type filter
    if (filter.types && filter.types.length > 0) {
      if (!filter.types.includes(transaction.type)) {
        return false
      }
    }

    // Status filter
    if (filter.status && filter.status.length > 0) {
      if (!filter.status.includes(transaction.status)) {
        return false
      }
    }

    // Asset filter
    if (filter.assets && filter.assets.length > 0) {
      if (!filter.assets.includes(transaction.asset.code)) {
        return false
      }
    }

    // Search query filter
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      const searchableFields = [
        transaction.hash,
        transaction.stellarTransactionId,
        transaction.from,
        transaction.to,
        transaction.memo,
        transaction.amount
      ].join(' ').toLowerCase()
      
      if (!searchableFields.includes(query)) {
        return false
      }
    }

    return true
  })
}

export const getBlockchainExplorerUrl = (transactionId: string, network: 'testnet' | 'mainnet' = 'mainnet'): string => {
  const baseUrl = network === 'testnet' 
    ? 'https://steexp.com/tx' 
    : 'https://stellar.expert/explorer/public/tx'
  return `${baseUrl}/${transactionId}`
}

export const formatTransactionAmount = (amount: string, assetCode: string): string => {
  const num = parseFloat(amount)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M ${assetCode}`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K ${assetCode}`
  }
  return `${num.toFixed(7)} ${assetCode}`
}

export const getTransactionTypeLabel = (type: Transaction['type']): string => {
  const labels: Record<Transaction['type'], string> = {
    payment: 'Payment',
    create_account: 'Create Account',
    manage_data: 'Manage Data',
    set_options: 'Set Options',
    change_trust: 'Change Trust',
    allow_trust: 'Allow Trust',
    account_merge: 'Account Merge',
    inflation: 'Inflation',
    manage_buy_offer: 'Manage Buy Offer',
    manage_sell_offer: 'Manage Sell Offer',
    create_passive_sell_offer: 'Create Passive Offer',
    path_payment_strict_receive: 'Path Payment (Receive)',
    path_payment_strict_send: 'Path Payment (Send)'
  }
  return labels[type] || type
}

export const getStatusColor = (status: Transaction['status']): string => {
  switch (status) {
    case 'confirmed':
      return 'text-green-600 bg-green-100'
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'failed':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export const exportToCSV = (transactions: Transaction[], options: ExportOptions): void => {
  const headers = [
    'Date',
    'Hash',
    'Type',
    'Status',
    'From',
    'To',
    'Amount',
    'Asset',
    'Fee',
    'Memo'
  ]

  const csvData = transactions.map(tx => [
    format(new Date(tx.timestamp), 'yyyy-MM-dd HH:mm:ss'),
    tx.hash,
    getTransactionTypeLabel(tx.type),
    tx.status,
    tx.from,
    tx.to,
    tx.amount,
    tx.asset.code,
    tx.fee.toString(),
    tx.memo || ''
  ])

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `transactions_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportToPDF = async (transactions: Transaction[], options: ExportOptions): Promise<void> => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  let yPosition = margin

  // Title
  pdf.setFontSize(16)
  pdf.text('Transaction History', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 20

  // Date range
  if (options.dateRange) {
    pdf.setFontSize(10)
    pdf.text(
      `Period: ${format(options.dateRange.start, 'yyyy-MM-dd')} - ${format(options.dateRange.end, 'yyyy-MM-dd')}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    )
    yPosition += 15
  }

  // Transactions
  pdf.setFontSize(8)
  transactions.forEach((tx, index) => {
    if (yPosition > 250) {
      pdf.addPage()
      yPosition = margin
    }

    const txText = [
      `${index + 1}. ${format(new Date(tx.timestamp), 'yyyy-MM-dd HH:mm')}`,
      `   Hash: ${tx.hash.substring(0, 20)}...`,
      `   Type: ${getTransactionTypeLabel(tx.type)}`,
      `   Status: ${tx.status}`,
      `   Amount: ${tx.amount} ${tx.asset.code}`,
      `   Fee: ${tx.fee} XLM`
    ]

    txText.forEach(line => {
      pdf.text(line, margin, yPosition)
      yPosition += 5
    })

    yPosition += 3
  })

  pdf.save(`transactions_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.pdf`)
}

export const calculateNetworkHealth = (stats: NetworkStats): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (stats.networkStatus !== 'online') return 'poor'
  
  const ledgerLag = stats.latestLedger - stats.currentLedger
  const avgCloseTime = stats.ledgerCloseTime / 1000 // Convert to seconds
  
  if (ledgerLag <= 1 && avgCloseTime <= 5) return 'excellent'
  if (ledgerLag <= 3 && avgCloseTime <= 10) return 'good'
  if (ledgerLag <= 10 && avgCloseTime <= 20) return 'fair'
  return 'poor'
}

export const getNetworkHealthColor = (health: ReturnType<typeof calculateNetworkHealth>): string => {
  switch (health) {
    case 'excellent':
      return 'text-green-600 bg-green-100'
    case 'good':
      return 'text-blue-600 bg-blue-100'
    case 'fair':
      return 'text-yellow-600 bg-yellow-100'
    case 'poor':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}
