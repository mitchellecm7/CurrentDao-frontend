// Mock type definitions for security components

declare module 'react' {
  export * from 'react';
}

declare module 'lucide-react' {
  export const Shield: any;
  export const Users: any;
  export const Plus: any;
  export const X: any;
  export const Check: any;
  export const AlertTriangle: any;
  export const Clock: any;
  export const Play: any;
  export const Pause: any;
  export const RotateCcw: any;
  export const CheckCircle: any;
  export const Zap: any;
  export const Brain: any;
  export const Search: any;
  export const TrendingUp: any;
  export const Eye: any;
  export const Info: any;
  export const BarChart3: any;
  export const Calculator: any;
  export const ChevronDown: any;
  export const ChevronUp: any;
  export const EyeOff: any;
}

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module '@stellar/stellar-sdk' {
  export const TransactionBuilder: any;
  export const Account: any;
  export const Networks: any;
  export const BASE_FEE: any;
}

// Performance API
declare global {
  interface Performance {
    now(): number;
  }
}

declare var performance: Performance;
