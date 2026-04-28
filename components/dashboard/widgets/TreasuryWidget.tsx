import React from "react";

export const TreasuryWidget: React.FC = () => {
  return (
    <div>
      <p>Treasury Balance</p>
      <div className="mt-2">
        <div className="text-2xl font-bold">$500,000</div>
        <div className="text-blue-500">Available Funds</div>
      </div>
      {/* Add more treasury details here */}
    </div>
  );
};
