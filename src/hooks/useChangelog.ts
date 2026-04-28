import React, { useState, useEffect } from 'react';
import { ChangelogService } from '../services/changelog/ChangelogService';
import { ChangelogEntry } from '../components/changelog/ChangelogModal';

export const useChangelog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unseenChanges, setUnseenChanges] = useState<ChangelogEntry[]>([]);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if we should show the changelog
    const shouldShowChangelog = ChangelogService.shouldShowChangelog();
    setShouldShow(shouldShowChangelog);

    if (shouldShowChangelog) {
      const unseen = ChangelogService.getUnseenChanges();
      setUnseenChanges(unseen);
      
      // Auto-open if there are unseen changes
      if (unseen.length > 0) {
        setIsOpen(true);
      }
    }

    // Set current app version
    ChangelogService.setCurrentAppVersion('2.1.0');
  }, []);

  const openChangelog = (version?: string) => {
    setIsOpen(true);
    if (version) {
      // Mark as read when opening specific version
      ChangelogService.markAsRead(version);
    }
  };

  const closeChangelog = () => {
    setIsOpen(false);
    // Mark latest version as read when closing
    ChangelogService.markAsRead();
    setShouldShow(false);
    setUnseenChanges([]);
  };

  const markAsRead = (version?: string) => {
    ChangelogService.markAsRead(version);
    setShouldShow(false);
    setUnseenChanges([]);
  };

  const getChangelog = () => ChangelogService.getChangelog();

  const getLatestVersion = () => ChangelogService.getLatestVersion();

  const getUnseenCount = () => unseenChanges.length;

  return {
    isOpen,
    shouldShow,
    unseenChanges,
    unseenCount: getUnseenCount(),
    openChangelog,
    closeChangelog,
    markAsRead,
    getChangelog,
    getLatestVersion
  };
};
