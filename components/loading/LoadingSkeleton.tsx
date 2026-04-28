"use client";

import React from "react";

export interface LoadingSkeletonProps {
  variant?: "default" | "dashboard" | "table" | "cards" | "chart";
  delay?: number;
  className?: string;
}

/**
 * Dashboard loading skeleton with multiple card layouts
 */
const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 animate-pulse"
          >
            <div className="h-4 bg-slate-200 rounded w-20 mb-3"></div>
            <div className="h-8 bg-slate-300 rounded w-full mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-32"></div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 animate-pulse"
          >
            <div className="h-6 bg-slate-200 rounded w-40 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex items-center">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-8 bg-slate-100 rounded w-20 ml-4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-10 bg-slate-100 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Table loading skeleton
 */
const TableSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
    <div className="h-6 bg-slate-200 rounded w-48 mb-4 animate-pulse"></div>
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="grid grid-cols-6 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <div key={j} className="h-12 bg-slate-100 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Cards grid loading skeleton
 */
const CardsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 animate-pulse"
      >
        <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
        <div className="space-y-3">
          <div className="h-6 bg-slate-300 rounded"></div>
          <div className="h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-4/5"></div>
          <div className="h-10 bg-slate-100 rounded mt-4"></div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Chart loading skeleton
 */
const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
    <div className="h-6 bg-slate-200 rounded w-40 mb-6 animate-pulse"></div>
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-end gap-2 animate-pulse">
          <div
            className="h-24 bg-blue-200 rounded w-full"
            style={{ height: `${20 + i * 15}px` }}
          ></div>
          <div
            className="h-20 bg-blue-200 rounded w-full"
            style={{ height: `${20 + (5 - i) * 15}px` }}
          ></div>
          <div
            className="h-16 bg-blue-200 rounded w-full"
            style={{ height: `${20 + (i % 3) * 15}px` }}
          ></div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Main LoadingSkeleton component
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = "default",
  delay = 200,
  className = "",
}) => {
  const [isVisible, setIsVisible] = React.useState(delay === 0);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!isVisible) {
    return null;
  }

  const content = {
    default: <DashboardSkeleton />,
    dashboard: <DashboardSkeleton />,
    table: <TableSkeleton />,
    cards: <CardsSkeleton />,
    chart: <ChartSkeleton />,
  };

  return <div className={className}>{content[variant] || content.default}</div>;
};

/**
 * Minimal loading spinner
 */
export const LoadingSpinner: React.FC<{
  message?: string;
  size?: "sm" | "md" | "lg";
}> = ({ message = "Loading...", size = "md" }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div
        className={`animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 ${sizeClasses[size]}`}
      ></div>
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSkeleton;
