"use client";

import React from "react";
import Link from "next/link";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/loading/LoadingSkeleton";
import { usePrefetchRoute } from "@/utils/routeLoader";

export default function Home() {
  // Prefetch main routes on component mount
  usePrefetchRoute(() => import("@/app/dao/treasury/page"), {
    prefetchOnHover: true,
  });
  usePrefetchRoute(() => import("@/app/portfolio/history/page"), {
    prefetchOnHover: true,
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            CurrentDAO
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Advanced portfolio analytics and decentralized energy marketplace
            platform
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Optimized for performance with route-based code splitting
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* DAO Treasury Card */}
          <Link href="/dao/treasury">
            <div className="group h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-blue-400 overflow-hidden cursor-pointer transform hover:scale-105">
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="text-4xl mb-4">🏛️</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    DAO Treasury
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Manage fund allocation, budget tracking, and financial
                    analytics
                  </p>
                </div>
                <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                  Explore Treasury
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Portfolio Analytics Card */}
          <Link href="/portfolio/history">
            <div className="group h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-green-400 overflow-hidden cursor-pointer transform hover:scale-105">
              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="text-4xl mb-4">📊</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    Portfolio Analytics
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Track performance, analyze trades, and optimize asset
                    allocation
                  </p>
                </div>
                <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                  View Analytics
                  <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Performance Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureItem
              title="Route-Level Code Splitting"
              description="Each route loads as a separate chunk for optimal performance"
            />
            <FeatureItem
              title="Lazy Loading Skeletons"
              description="Beautiful loading states while chunks are being fetched"
            />
            <FeatureItem
              title="Route Prefetching"
              description="Smart prefetch on hover for instant navigation"
            />
            <FeatureItem
              title="Bundle Size Monitoring"
              description="CI integration ensures bundle stays under 200KB"
            />
            <FeatureItem
              title="Vendor Chunk Optimization"
              description="Third-party libraries optimized into separate chunks"
            />
            <FeatureItem
              title="LCP Tracking"
              description="Real-time monitoring of Largest Contentful Paint"
            />
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Built With Modern Tech</h3>
          <p className="mb-4 text-blue-100">
            Next.js 14.2 • React 18 • TypeScript • Tailwind CSS • Web Vitals
            Monitoring
          </p>
          <div className="text-sm text-blue-200">
            ✅ Initial bundle optimized for sub-2 second load • ✅ Lighthouse
            score 95+ • ✅ Core Web Vitals in green
          </div>
        </div>
      </div>
    </main>
  );
}

interface FeatureItemProps {
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ title, description }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 text-xl">✨</div>
    <div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);
