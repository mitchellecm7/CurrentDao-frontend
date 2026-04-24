'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeGestures } from '../../hooks/useSwipeGestures';

interface SwipeNavigationProps {
  children: React.ReactNode[];
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  navigationItems: Array<{ label: string; icon: React.ReactNode }>;
}

const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  initialIndex = 0,
  onIndexChange,
  navigationItems,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  const navigateTo = (index: number) => {
    if (index < 0 || index >= children.length) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    if (onIndexChange) onIndexChange(index);
  };

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipeGestures({
    onSwipeLeft: () => navigateTo(currentIndex + 1),
    onSwipeRight: () => navigateTo(currentIndex - 1),
  });

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div 
      className="relative flex h-screen flex-col overflow-hidden bg-background"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Dynamic Header */}
      <header className="safe-area-top sticky top-0 z-20 w-full border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-center px-4">
          <h1 className="text-lg font-bold text-foreground">
            {navigationItems[currentIndex].label}
          </h1>
        </div>
      </header>

      {/* Content Area */}
      <main className="relative flex-grow flex-1">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            className="absolute inset-0 h-full w-full overflow-y-auto px-4 py-6"
          >
            {children[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="safe-area-bottom sticky bottom-0 z-20 w-full border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="flex items-center justify-around h-20">
          {navigationItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigateTo(index)}
              className={`
                relative flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors
                ${currentIndex === index ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              <div className={`p-2 rounded-xl transition-all ${currentIndex === index ? 'bg-primary/10' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
              {currentIndex === index && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute -top-px h-1 w-8 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default SwipeNavigation;
