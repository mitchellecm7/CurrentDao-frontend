'use client';

import React, { useState, useCallback } from 'react';
import type { NotificationCategory, NotificationFrequency } from '@/notifications/types';

// Extended event types for email-specific alerts
type EmailEventType =
  | 'price_alert_large'
  | 'proposal_deadline'
  | 'governance_vote'
  | 'trade_executed'
  | 'staking_reward'
  | 'treasury_alert'
  | 'security_alert';

interface EmailEventConfig {
  id: EmailEventType;
  label: string;
  description: string;
  isCritical: boolean;
}

const EMAIL_EVENTS: EmailEventConfig[] = [
  { id: 'security_alert', label: 'Security Alerts', description: 'Login from new device, suspicious activity', isCritical: true },
  { id: 'price_alert_large', label: 'Large Price Moves', description: 'Asset price changes >10% in 24h', isCritical: true },
  { id: 'proposal_deadline', label: 'Proposal Deadlines', description: 'Governance proposals closing within 24h', isCritical: true },
  { id: 'governance_vote', label: 'Governance Votes', description: 'New proposals and vote results', isCritical: false },
  { id: 'trade_executed', label: 'Trade Executed', description: 'Confirmation when your trades complete', isCritical: false },
  { id: 'staking_reward', label: 'Staking Rewards', description: 'When staking rewards are distributed', isCritical: false },
  { id: 'treasury_alert', label: 'Treasury Alerts', description: 'Significant treasury movements', isCritical: false },
];

interface EmailPreferences {
  email: string;
  enabled: boolean;
  digestFrequency: NotificationFrequency;
  events: Record<EmailEventType, boolean>;
  gdprConsent: boolean;
  consentDate: string | null;
}

const DEFAULT_PREFS: EmailPreferences = {
  email: '',
  enabled: false,
  digestFrequency: 'daily_digest',
  events: {
    security_alert: true,
    price_alert_large: true,
    proposal_deadline: true,
    governance_vote: false,
    trade_executed: false,
    staking_reward: false,
    treasury_alert: false,
  },
  gdprConsent: false,
  consentDate: null,
};

const FREQUENCY_OPTIONS: { id: NotificationFrequency; label: string; description: string }[] = [
  { id: 'realtime', label: 'Immediate', description: 'Send as events happen' },
  { id: 'daily_digest', label: 'Daily Digest', description: 'One summary email per day' },
  { id: 'weekly', label: 'Weekly Digest', description: 'One summary email per week' },
];

// Email template preview
function EmailPreview({ prefs }: { prefs: EmailPreferences }) {
  const enabledEvents = EMAIL_EVENTS.filter(e => prefs.events[e.id]);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-sm">
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
        Preview: Email notification template
      </div>
      <div className="p-5 bg-white dark:bg-gray-800 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">CD</div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">CurrentDAO Notifications</p>
            <p className="text-xs text-gray-500">notifications@currentdao.org</p>
          </div>
        </div>
        <hr className="border-gray-200 dark:border-gray-700" />
        <p className="font-medium text-gray-900 dark:text-white">
          {prefs.digestFrequency === 'realtime' ? '🔔 New Alert' : prefs.digestFrequency === 'daily_digest' ? '📋 Your Daily Summary' : '📋 Your Weekly Summary'}
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-xs">
          You are subscribed to: {enabledEvents.length > 0 ? enabledEvents.map(e => e.label).join(', ') : 'no events'}
        </p>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-xs text-gray-500 dark:text-gray-400">
          [Event details would appear here]
        </div>
        <p className="text-xs text-gray-400">
          You received this because you opted in to email notifications.{' '}
          <span className="text-blue-500 underline cursor-pointer">Unsubscribe</span> ·{' '}
          <span className="text-blue-500 underline cursor-pointer">Manage preferences</span>
        </p>
      </div>
    </div>
  );
}

export function EmailNotificationPreferences() {
  const [prefs, setPrefs] = useState<EmailPreferences>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [emailError, setEmailError] = useState('');

  const updateEvent = useCallback((id: EmailEventType, value: boolean) => {
    setPrefs(p => ({ ...p, events: { ...p.events, [id]: value } }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!prefs.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (!prefs.gdprConsent) {
      setEmailError('You must consent to receive email notifications.');
      return;
    }
    setEmailError('');
    // In production: persist to backend / encrypted user profile
    setPrefs(p => ({ ...p, consentDate: new Date().toISOString() }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [prefs]);

  const handleUnsubscribeAll = useCallback(() => {
    setPrefs(p => ({
      ...p,
      enabled: false,
      events: Object.fromEntries(EMAIL_EVENTS.map(e => [e.id, false])) as Record<EmailEventType, boolean>,
    }));
    setSaved(false);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Notification Preferences</h1>
        <p className="text-sm text-gray-500 mt-1">Configure which events trigger email notifications and how often.</p>
      </div>

      {/* Master toggle + email */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">Email Notifications</p>
            <p className="text-xs text-gray-500 mt-0.5">Master toggle for all email alerts</p>
          </div>
          <button
            role="switch"
            aria-checked={prefs.enabled}
            onClick={() => { setPrefs(p => ({ ...p, enabled: !p.enabled })); setSaved(false); }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${prefs.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {prefs.enabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              value={prefs.email}
              onChange={e => { setPrefs(p => ({ ...p, email: e.target.value })); setEmailError(''); setSaved(false); }}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
          </div>
        )}
      </div>

      {prefs.enabled && (
        <>
          {/* Digest frequency */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Delivery Frequency</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FREQUENCY_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setPrefs(p => ({ ...p, digestFrequency: opt.id })); setSaved(false); }}
                  className={`text-left p-3 rounded-lg border-2 transition-colors ${prefs.digestFrequency === opt.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Event toggles */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">Event Types</h2>
              <p className="text-xs text-gray-500 mt-0.5">Critical alerts are always sent immediately regardless of digest setting.</p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {EMAIL_EVENTS.map(event => (
                <div key={event.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{event.label}</p>
                      {event.isCritical && (
                        <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={prefs.events[event.id]}
                    onClick={() => updateEvent(event.id, !prefs.events[event.id])}
                    className={`flex-shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${prefs.events[event.id] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${prefs.events[event.id] ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* GDPR consent */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Consent & Privacy</h2>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.gdprConsent}
                onChange={e => { setPrefs(p => ({ ...p, gdprConsent: e.target.checked })); setSaved(false); }}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I consent to receive email notifications from CurrentDAO. I understand I can unsubscribe at any time via the unsubscribe link in any email. My email address will be processed in accordance with the{' '}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
              </span>
            </label>
            {prefs.consentDate && (
              <p className="text-xs text-gray-400">Consent recorded: {new Date(prefs.consentDate).toLocaleString()}</p>
            )}
          </div>

          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(p => !p)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showPreview ? 'Hide' : 'Preview'} email template
          </button>
          {showPreview && <EmailPreview prefs={prefs} />}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Save Preferences
            </button>
            <button
              onClick={handleUnsubscribeAll}
              className="px-5 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Unsubscribe from All
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">✓ Preferences saved</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
