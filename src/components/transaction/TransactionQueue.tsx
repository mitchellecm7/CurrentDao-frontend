'use client'

import { useState, useEffect, useRef } from 'react'
import {
  X,
  Check,
  Clock,
  RotateCcw,
  GripVertical
} from 'lucide-react'

interface QueuedTransaction {
  id: string
  type: 'send' | 'swap' | 'stake' | 'vote' | 'delegate'
  amount: string
  recipient?: string
  token: string
  gasFee: string
  priority: number
  expiresAt: Date
  details: string
}

interface TransactionQueueProps {
  className?: string
}

export function TransactionQueue({ className }: TransactionQueueProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [transactions, setTransactions] = useState<QueuedTransaction[]>([])
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const queueRef = useRef<HTMLDivElement>(null)

  // Initialize with mock data
  useEffect(() => {
    const mockTransactions: QueuedTransaction[] = [
      {
        id: '1',
        type: 'send',
        amount: '0.5',
        recipient: '0x1234...5678',
        token: 'ETH',
        gasFee: '0.0021',
        priority: 1,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        details: 'Send 0.5 ETH to 0x1234...5678'
      },
      {
        id: '2',
        type: 'swap',
        amount: '1000',
        token: 'USDC',
        gasFee: '0.0035',
        priority: 2,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        details: 'Swap 1000 USDC for ETH'
      },
      {
        id: '3',
        type: 'vote',
        amount: '0',
        token: 'GOV',
        gasFee: '0.0018',
        priority: 3,
        expiresAt: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
        details: 'Vote on proposal #42: Infrastructure upgrade'
      }
    ]
    setTransactions(mockTransactions)
  }, [])

  // Check for expired transactions
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions(prev => 
        prev.filter(tx => tx.expiresAt > new Date())
      )
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const minutes = Math.floor(diff / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const handleDragStart = (index: number) => {
    setDraggedItem(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedItem === null) return

    const draggedTransaction = transactions[draggedItem]
    const newTransactions = [...transactions]
    newTransactions.splice(draggedItem, 1)
    newTransactions.splice(dropIndex, 0, draggedTransaction)
    
    // Update priorities
    const updatedTransactions = newTransactions.map((tx, index) => ({
      ...tx,
      priority: index + 1
    }))
    
    setTransactions(updatedTransactions)
    setDraggedItem(null)
  }

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(transactions.map(tx => tx.id)))
    }
  }

  const handleRemoveTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id))
    setSelectedTransactions(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const handleClearQueue = () => {
    if (confirm('Are you sure you want to clear all pending transactions?')) {
      setTransactions([])
      setSelectedTransactions(new Set())
    }
  }

  const handleApproveSelected = async () => {
    if (selectedTransactions.size === 0) return
    
    setIsProcessing(true)
    
    try {
      // Simulate processing transactions
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Remove approved transactions
      setTransactions(prev => 
        prev.filter(tx => !selectedTransactions.has(tx.id))
      )
      setSelectedTransactions(new Set())
      
      // Show success message
      alert('Transactions approved successfully!')
    } catch (error) {
      alert('Failed to approve transactions. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectSelected = () => {
    if (selectedTransactions.size === 0) return
    
    if (confirm(`Are you sure you want to reject ${selectedTransactions.size} transaction(s)?`)) {
      setTransactions(prev => 
        prev.filter(tx => !selectedTransactions.has(tx.id))
      )
      setSelectedTransactions(new Set())
    }
  }

  const getTransactionIcon = (type: QueuedTransaction['type']) => {
    switch (type) {
      case 'send':
        return '💸'
      case 'swap':
        return '🔄'
      case 'stake':
        return '🔒'
      case 'vote':
        return '🗳️'
      case 'delegate':
        return '👥'
      default:
        return '📄'
    }
  }

  const getTransactionColor = (type: QueuedTransaction['type']) => {
    switch (type) {
      case 'send':
        return 'text-blue-600 bg-blue-100'
      case 'swap':
        return 'text-green-600 bg-green-100'
      case 'stake':
        return 'text-purple-600 bg-purple-100'
      case 'vote':
        return 'text-orange-600 bg-orange-100'
      case 'delegate':
        return 'text-pink-600 bg-pink-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const pendingCount = transactions.length
  const selectedCount = selectedTransactions.size

  return (
    <div className={cn("relative", className)} ref={queueRef}>
      {/* Queue Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          pendingCount > 0 ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "hover:bg-accent"
        )}
      >
        <div className="w-5 h-5 border-2 border-current rounded-tl-sm rounded-tr-sm rounded-bl-lg rounded-br-sm" />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </button>

      {/* Queue Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Transaction Queue</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-accent rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{pendingCount} pending transaction{pendingCount !== 1 ? 's' : ''}</span>
              {pendingCount > 0 && (
                <button
                  onClick={handleClearQueue}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Transaction List */}
          <div className="flex-1 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-current rounded-tl-sm rounded-tr-sm rounded-bl-lg rounded-br-sm" />
                </div>
                <p>No pending transactions</p>
              </div>
            ) : (
              <div className="divide-y">
                {transactions.map((tx, index) => (
                  <div
                    key={tx.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className={cn(
                      "p-4 hover:bg-accent/50 transition-colors",
                      draggedItem === index && "opacity-50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Drag Handle */}
                      <div className="mt-1 cursor-move">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                      </div>

                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(tx.id)}
                        onChange={() => handleSelectTransaction(tx.id)}
                        className="mt-1"
                      />

                      {/* Transaction Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            getTransactionColor(tx.type)
                          )}>
                            {getTransactionIcon(tx.type)} {tx.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Priority #{tx.priority}
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium truncate">{tx.details}</p>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Gas: {tx.gasFee} ETH</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className={cn(
                              tx.expiresAt <= new Date() && "text-red-600"
                            )}>
                              {getTimeRemaining(tx.expiresAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveTransaction(tx.id)}
                        className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {transactions.length > 0 && (
            <div className="p-4 border-t bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.size === transactions.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                  Select all ({selectedCount})
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRejectSelected}
                  disabled={selectedCount === 0}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject {selectedCount > 0 && `(${selectedCount})`}
                </button>
                <button
                  onClick={handleApproveSelected}
                  disabled={selectedCount === 0 || isProcessing}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Approve {selectedCount > 0 && `(${selectedCount})`}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
