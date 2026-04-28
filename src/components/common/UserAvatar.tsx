"use client";

import { useMemo } from "react";
import { generateIdenticon, getDisplayName } from "@/utils/nameService";
import { UserProfile } from "@/types/profile";

interface UserAvatarProps {
  profile: UserProfile;
  size?: number;
  className?: string;
  showDisplayName?: boolean;
  fallbackToIdenticon?: boolean;
}

export function UserAvatar({
  profile,
  size = 32,
  className = "",
  showDisplayName = false,
  fallbackToIdenticon = true,
}: UserAvatarProps) {
  const displayName = useMemo(() => getDisplayName(profile), [profile]);

  const avatarSrc = useMemo(() => {
    if (profile.avatar) {
      return profile.avatar;
    }

    if (fallbackToIdenticon && profile.stellarAddress) {
      return generateIdenticon(profile.stellarAddress, size);
    }

    // Default avatar
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`;
  }, [profile, size, fallbackToIdenticon]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className="rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm"
        style={{ width: size, height: size }}
      >
        <img
          src={avatarSrc}
          alt={`${displayName}'s avatar`}
          className="w-full h-full object-cover"
        />
      </div>

      {showDisplayName && (
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {displayName}
        </span>
      )}
    </div>
  );
}
