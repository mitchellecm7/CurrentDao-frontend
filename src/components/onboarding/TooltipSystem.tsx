'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div 
      className="relative inline-block cursor-help group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`
              absolute z-[100] w-64 bg-card border border-border rounded-xl shadow-2xl p-4
              text-sm font-bold leading-relaxed text-foreground
              ${getPositionStyles()}
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-secondary rounded-lg">
                <HelpCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Expert Tip</span>
            </div>
            {content}
            <div className={`absolute w-3 h-3 bg-card border-b border-r border-border rotate-45 ${position === 'top' ? 'bottom-[-6.5px] left-1/2 -translate-x-1/2' : ''}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
