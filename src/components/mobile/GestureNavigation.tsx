'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface GestureNavigationProps {
  tabs: Array<{ label: string; icon: React.ReactNode }>
  activeTab: number
  onTabChange: (index: number) => void
}

export function GestureNavigation({ tabs, activeTab, onTabChange }: GestureNavigationProps) {
  return (
    <div className="flex space-x-1 px-2 py-2">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => onTabChange(index)}
          className={`
            flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all
            min-h-[44px] touch-manipulation
            ${activeTab === index 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <div className="mb-1">
            {tab.icon}
          </div>
          <span className="text-xs font-medium">
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}
