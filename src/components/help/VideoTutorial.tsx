'use client';

import React, { useState } from 'react';
import { Play, PlayCircle, Clock, X, Terminal, Wallet, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VIDEO_TUTORIALS = [
  {
    id: 'trading-basics',
    title: 'Marketplace Basics',
    description: 'Learn how to buy and sell energy kWh on the decentralized exchange.',
    duration: '2:45',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=300&fit=crop',
    icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
  },
  {
    id: 'wallet-setup',
    title: 'Connecting Your Wallet',
    description: 'A step-by-step guide to connecting your Stellar or Ethereum wallet.',
    duration: '1:30',
    thumbnail: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=500&h=300&fit=crop',
    icon: <Wallet className="h-5 w-5 text-blue-500" />,
  },
  {
    id: 'staking-governance',
    title: 'Governance & Staking',
    description: 'Participate in network decisions and earn rewards by staking tokens.',
    duration: '3:15',
    thumbnail: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=500&h=300&fit=crop',
    icon: <Terminal className="h-5 w-5 text-amber-500" />,
  },
];

const VideoTutorial: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const currentVideo = VIDEO_TUTORIALS.find((v) => v.id === activeVideo);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-secondary rounded-2xl">
          <PlayCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">Video Tutorials</h2>
          <p className="text-sm text-muted-foreground">Watch quick guides to master the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {VIDEO_TUTORIALS.map((video) => (
          <motion.div
            key={video.id}
            whileHover={{ y: -4 }}
            className="group relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setActiveVideo(video.id)}
                  className="p-4 bg-emerald-500 text-white rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300"
                >
                  <Play className="h-6 w-6 fill-current" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {video.duration}
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary rounded-xl">
                  {video.icon}
                </div>
                <h4 className="text-sm font-bold text-foreground truncate">{video.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {video.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeVideo && currentVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="aspect-video bg-muted/20 flex flex-col items-center justify-center gap-4">
                 <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                 <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading secure video player...</span>
                 <p className="text-xs text-muted-foreground/50">{currentVideo.title} • {currentVideo.duration}</p>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoTutorial;
