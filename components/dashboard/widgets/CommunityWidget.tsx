import React from "react";

export const CommunityWidget: React.FC = () => {
  return (
    <div>
      <p>Community Activity</p>
      <div className="mt-2">
        <div className="text-2xl font-bold">1,250</div>
        <div className="text-purple-500">Active Members</div>
      </div>
      {/* Add more community details here */}
    </div>
  );
};
