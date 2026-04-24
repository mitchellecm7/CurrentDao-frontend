'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareContent {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

interface NativeSharingProps {
  content?: ShareContent;
  onShareComplete?: (result: 'success' | 'error' | 'cancelled') => void;
  enableFileSharing?: boolean;
  platforms?: ('ios' | 'android' | 'web')[];
}

const NativeSharing: React.FC<NativeSharingProps> = ({
  content,
  onShareComplete,
  enableFileSharing = true,
  platforms = ['ios', 'android', 'web'],
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<'success' | 'error' | 'cancelled' | null>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web' | 'unknown'>('unknown');
  const [copiedText, setCopiedText] = useState(false);

  // Detect current platform
  const detectPlatform = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    } else if (/android/.test(userAgent)) {
      return 'android';
    } else {
      return 'web';
    }
  }, []);

  // Initialize platform detection
  useEffect(() => {
    setPlatform(detectPlatform());
  }, [detectPlatform]);

  // Native Web Share API
  const shareWithNativeAPI = useCallback(async (shareData: ShareContent) => {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    const data: ShareData = {
      title: shareData.title,
      text: shareData.text,
      url: shareData.url,
    };

    if (shareData.files && shareData.files.length > 0) {
      // Web Share API Level 2 supports files
      data.files = shareData.files;
    }

    try {
      await navigator.share(data);
      return 'success';
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return 'cancelled';
      }
      throw error;
    }
  }, []);

  // iOS-specific sharing
  const shareOnIOS = useCallback(async (shareData: ShareContent) => {
    // For iOS, try native share first, fallback to custom methods
    try {
      return await shareWithNativeAPI(shareData);
    } catch (error) {
      // Fallback for iOS: copy to clipboard with instructions
      if (shareData.text || shareData.url) {
        const textToCopy = [shareData.text, shareData.url].filter(Boolean).join('\n');
        await navigator.clipboard.writeText(textToCopy);
        toast.success('Content copied to clipboard - paste to share');
        return 'success';
      }
      throw error;
    }
  }, [shareWithNativeAPI]);

  // Android-specific sharing
  const shareOnAndroid = useCallback(async (shareData: ShareContent) => {
    // Android typically has better Web Share API support
    try {
      return await shareWithNativeAPI(shareData);
    } catch (error) {
      // Fallback: create share intent
      const shareText = [shareData.title, shareData.text, shareData.url]
        .filter(Boolean)
        .join('\n\n');
      
      const encodedText = encodeURIComponent(shareText);
      const shareUrl = `https://wa.me/?text=${encodedText}`;
      
      window.open(shareUrl, '_blank');
      return 'success';
    }
  }, [shareWithNativeAPI]);

  // Web fallback sharing
  const shareOnWeb = useCallback(async (shareData: ShareContent) => {
    const shareText = [shareData.title, shareData.text, shareData.url]
      .filter(Boolean)
      .join('\n\n');

    // Multiple sharing options for web
    const options = [
      {
        name: 'Copy Link',
        icon: AlertCircle,
        action: async () => {
          await navigator.clipboard.writeText(shareText);
          setCopiedText(true);
          setTimeout(() => setCopiedText(false), 2000);
        }
      },
      {
        name: 'Email',
        icon: CheckCircle,
        action: () => {
          const subject = encodeURIComponent(shareData.title || 'Check this out');
          const body = encodeURIComponent(shareText);
          window.open(`mailto:?subject=${subject}&body=${body}`);
        }
      },
      {
        name: 'WhatsApp',
        icon: AlertCircle,
        action: () => {
          const encodedText = encodeURIComponent(shareText);
          window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        }
      },
      {
        name: 'Download',
        icon: CheckCircle,
        action: () => {
          if (shareData.files && shareData.files.length > 0) {
            shareData.files.forEach(file => {
              const url = URL.createObjectURL(file);
              const a = document.createElement('a');
              a.href = url;
              a.download = file.name;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            });
          } else if (shareData.text) {
            const blob = new Blob([shareData.text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'shared-content.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }
      }
    ];

    // Show options (in a real app, this would be a modal)
    const selectedOption = options[0]; // For demo, select first option
    await selectedOption.action();
    
    return 'success';
  }, []);

  // Main share function
  const handleShare = useCallback(async (customContent?: ShareContent) => {
    const shareData = customContent || content || {
      title: 'CurrentDao Energy Trading',
      text: 'Check out this energy trading opportunity!',
      url: window.location.href,
    };

    setIsSharing(true);
    setShareResult(null);

    try {
      let result: 'success' | 'error' | 'cancelled';

      switch (platform) {
        case 'ios':
          result = await shareOnIOS(shareData);
          break;
        case 'android':
          result = await shareOnAndroid(shareData);
          break;
        case 'web':
          result = await shareOnWeb(shareData);
          break;
        default:
          result = await shareOnWeb(shareData);
      }

      setShareResult(result);
      onShareComplete?.(result);

      if (result === 'success') {
        toast.success('Content shared successfully!');
      } else if (result === 'cancelled') {
        toast('Sharing cancelled');
      }

    } catch (error) {
      console.error('Share failed:', error);
      setShareResult('error');
      onShareComplete?.('error');
      toast.error('Failed to share content');
    } finally {
      setIsSharing(false);
    }
  }, [content, platform, shareOnIOS, shareOnAndroid, shareOnWeb, onShareComplete]);

  // Quick share actions
  const quickShareActions = [
    {
      name: 'Share Trade',
      icon: CheckCircle,
      action: () => handleShare({
        title: 'Energy Trade Opportunity',
        text: 'I found this great energy trade opportunity on CurrentDao',
        url: window.location.href,
      }),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Share Profile',
      icon: AlertCircle,
      action: () => handleShare({
        title: 'My CurrentDao Profile',
        text: 'Connect with me on CurrentDao for energy trading',
        url: `${window.location.origin}/profile`,
      }),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      name: 'Copy Link',
      icon: CheckCircle,
      action: async () => {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
        toast.success('Link copied to clipboard');
      },
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border-2 border-purple-500 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-purple-500" />
          <h3 className="text-white font-bold text-lg">Native Sharing</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${
            platform === 'ios' ? 'bg-blue-500/20 text-blue-400' :
            platform === 'android' ? 'bg-green-500/20 text-green-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {platform === 'ios' ? 'iOS' :
             platform === 'android' ? 'Android' : 'Web'}
          </span>
          {shareResult && (
            <span className={`px-2 py-1 rounded text-xs ${
              shareResult === 'success' ? 'bg-green-500/20 text-green-400' :
              shareResult === 'error' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {shareResult === 'success' ? 'Success' :
               shareResult === 'error' ? 'Error' : 'Cancelled'}
            </span>
          )}
        </div>
      </div>

      {/* Quick Share Actions */}
      <div className="space-y-3 mb-6">
        {quickShareActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            disabled={isSharing}
            className={`w-full flex items-center gap-3 px-4 py-3 ${action.color} disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-white`}
          >
            <action.icon className="w-5 h-5" />
            <span>{action.name}</span>
            {isSharing && (
              <div className="ml-auto">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Platform-specific Features */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <h4 className="text-white font-medium mb-3">Platform Features</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Native Share API</span>
            <span className={navigator.share ? 'text-green-400' : 'text-red-400'}>
              {navigator.share ? '✓ Available' : '✗ Not Available'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Clipboard Access</span>
            <span className={navigator.clipboard ? 'text-green-400' : 'text-red-400'}>
              {navigator.clipboard ? '✓ Available' : '✗ Not Available'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">File Sharing</span>
            <span className={enableFileSharing ? 'text-green-400' : 'text-yellow-400'}>
              {enableFileSharing ? '✓ Enabled' : '⚠ Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Share Status */}
      {shareResult && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${
          shareResult === 'success' ? 'bg-green-500/20 border-green-500' :
          shareResult === 'error' ? 'bg-red-500/20 border-red-500' :
          'bg-yellow-500/20 border-yellow-500'
        }`}>
          {shareResult === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : shareResult === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
          <div className="text-sm">
            <div className={`font-medium ${
              shareResult === 'success' ? 'text-green-400' :
              shareResult === 'error' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {shareResult === 'success' ? 'Share Successful' :
               shareResult === 'error' ? 'Share Failed' : 'Share Cancelled'}
            </div>
            <div className="text-gray-400 mt-1">
              {shareResult === 'success' ? 'Content has been shared successfully.' :
               shareResult === 'error' ? 'There was an error sharing the content.' :
               'User cancelled the sharing operation.'}
            </div>
          </div>
        </div>
      )}

      {/* Copied Indicator */}
      {copiedText && (
        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500 rounded-md flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-400" />
          <p className="text-blue-400 text-sm">Link copied to clipboard!</p>
        </div>
      )}

      {/* Platform Compatibility Info */}
      <div className="mt-6 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Platform Support</span>
          <span>
            {platforms.map(p => p.toUpperCase()).join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NativeSharing;
