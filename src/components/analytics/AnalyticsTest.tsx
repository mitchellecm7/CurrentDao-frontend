import React from 'react';
import { AnalyticsDashboard } from './AnalyticsDashboard';

// Simple test component to verify analytics integration
export const AnalyticsTest: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Analytics System Test</h1>
      <p className="mb-6">Testing the comprehensive user behavior analytics system for CurrentDao.</p>
      
      <AnalyticsDashboard />
    </div>
  );
};

export default AnalyticsTest;
