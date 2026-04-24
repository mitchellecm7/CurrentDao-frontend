'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle, TrendingUp, Wallet, ShieldCheck, Terminal } from 'lucide-react';
import { FAQItem } from '../../types/onboarding';

const MARKETPLACE_FAQ: FAQItem[] = [
  {
    question: 'How do I start trading energy on CurrentDao?',
    answer: 'To start trading, you first need to connect your wallet (Stellar or Ethereum). Once connected, navigate to the Dashboard and browse active energy orders. Choose the amount of kWh you want to buy or sell, review the details, and sign the transaction to execute the trade on the blockchain.',
    category: 'trading',
  },
  {
    question: 'What is a Clean Energy kWh?',
    answer: 'Clean Energy kWh is a digital token representing one kilowatt-hour of energy produced from renewable sources. Each token is backed by real-world energy production monitoring from certified physical meters.',
    category: 'trading',
  },
  {
    question: 'How do I connect my wallet?',
    answer: 'Click the "Connect Wallet" button in the navigation bar. You can choose between various providers like MetaMask, WalletConnect, or Stellar\'s Albedo. Follow the prompts in your browser extension to authorize CurrentDao.',
    category: 'account',
  },
  {
    question: 'What happens to my energy production data?',
    answer: 'Your production data is monitored by secure physical meters and recorded on the protocol. This data is used to mint new energy tokens and verify the authenticity of your kilowatt-hours.',
    category: 'technical',
  },
  {
    question: 'Is CurrentDao decentralized?',
    answer: 'Yes, CurrentDao is built on a decentralized protocol where decisions are made by governance token holders and energy transactions are executed directly between producers and consumers on the blockchain.',
    category: 'general',
  },
];

const icons: Record<string, React.ReactNode> = {
  trading: <TrendingUp className="h-4 w-4 text-emerald-500" />,
  account: <Wallet className="h-4 w-4 text-blue-500" />,
  technical: <Terminal className="h-4 w-4 text-amber-500" />,
  general: <ShieldCheck className="h-4 w-4 text-purple-500" />,
};

const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleOpen = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-secondary rounded-2xl">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground">Everything you need to know about the marketplace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MARKETPLACE_FAQ.map((faq, index) => (
          <div 
            key={index} 
            className={`
              bg-card border border-border rounded-2xl overflow-hidden transition-all
              ${openId === index ? 'shadow-xl shadow-primary/5 ring-2 ring-primary/10' : 'hover:border-accent'}
            `}
          >
            <button
              onClick={() => toggleOpen(index)}
              className="flex items-center justify-between w-full h-full p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-secondary/50 rounded-xl">
                  {icons[faq.category]}
                </div>
                <h4 className="text-sm font-bold text-foreground leading-tight">
                  {faq.question}
                </h4>
              </div>
              <div className={`p-1 rounded-full transition-transform ${openId === index ? 'rotate-180 bg-primary/10 text-primary' : 'text-muted-foreground bg-secondary'}`}>
                <ChevronDown className="h-4 w-4" />
              </div>
            </button>
            <AnimatePresence>
              {openId === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 overflow-hidden"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed pr-8">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
