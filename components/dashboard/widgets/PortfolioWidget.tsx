import React from "react";

export const PortfolioWidget: React.FC = () => {
  return (
    <div>
      <p>Portfolio Overview</p>
      <div className="mt-2">
        <div className="text-2xl font-bold">$125,000</div>
        <div className="text-green-500">+5.2% this month</div>
      </div>
      {/* Add more portfolio details here */}
    </div>
  );
};
