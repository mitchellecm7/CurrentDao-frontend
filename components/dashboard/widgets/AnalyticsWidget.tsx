import React from "react";

export const AnalyticsWidget: React.FC = () => {
  return (
    <div>
      <p>Analytics</p>
      <div className="mt-2">
        <div className="text-2xl font-bold">95%</div>
        <div className="text-orange-500">System Uptime</div>
      </div>
      {/* Add more analytics details here */}
    </div>
  );
};
