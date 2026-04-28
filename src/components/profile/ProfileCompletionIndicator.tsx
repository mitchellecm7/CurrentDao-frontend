"use client";

import { CheckCircle, Circle } from "lucide-react";
import { ProfileCompletionItem } from "@/types/profile";

interface ProfileCompletionIndicatorProps {
  completionItems: ProfileCompletionItem[];
  className?: string;
}

export function ProfileCompletionIndicator({
  completionItems,
  className = "",
}: ProfileCompletionIndicatorProps) {
  const completedCount = completionItems.filter(
    (item) => item.completed,
  ).length;
  const totalCount = completionItems.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Profile Completion
        </h3>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {completionPercentage}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Completion Items */}
      <div className="space-y-2">
        {completionItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            {item.completed ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
            <span
              className={`text-sm ${item.completed ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}
            >
              {item.label}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>
        ))}
      </div>

      {completionPercentage < 100 && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Complete your profile to unlock more features and build trust in the
          community.
        </p>
      )}
    </div>
  );
}
