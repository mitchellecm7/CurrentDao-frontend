'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider } from '@/hooks/useStellarWallet'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider network="testnet" autoConnect={false}>
        {children}
      </WalletProvider>
    </QueryClientProvider>
  )
}
