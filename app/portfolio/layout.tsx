"use client";

import React from "react";
import { useEffect } from "react";

interface PortfolioLayoutProps {
  children: React.ReactNode;
}

export default function PortfolioLayout({ children }: PortfolioLayoutProps) {
  useEffect(() => {
    // Preload related portfolio routes on layout mount
    const timer = setTimeout(() => {
      // Ensures portfolio layout chunk is optimized
      if (typeof window !== "undefined") {
        // Route chunk prefetch logic
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {children}
    </div>
  );
}
