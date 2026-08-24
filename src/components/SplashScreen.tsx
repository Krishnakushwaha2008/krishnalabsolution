import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KLSLogo } from './KLSLogo';
import { Shield, Eye, Cpu, Radio, CheckCircle, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing KLS Neural Engine...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(25);
      setStatusText('Connecting AXIS ARTPEC-8 VAPIX Protocol...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(60);
      setStatusText('Loading AI Weapon Detection Vision Models...');
    }, 900);

    const timer3 = setTimeout(() => {
      setProgress(85);
      setStatusText('Calibrating Bounding Box Threat Evaluator...');
    }, 1400);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setStatusText('Security Perimeter Online & Verified.');
    }, 1900);

    const timer5 = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        id="kls-splash-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none"
      >
        {/* Subtle high-tech background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Central Card */}
        <motion.div
          initial={{ scale: 0.92, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center max-w-lg w-full px-8 py-10 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl"
        >
          {/* Main Logo & Tagline */}
          <div className="mb-6 flex flex-col items-center text-center">
            <KLSLogo size="xl" showTagline={false} className="justify-center mb-3" />
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-semibold tracking-wide text-amber-400 mt-1"
            >
              "Smart AI Surveillance for Safer Spaces"
            </motion.p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Real-time visible weapon identification (guns, knives) with AXIS network camera integration.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-2 w-full mb-6">
            <div className="flex flex-col items-center p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
              <Eye className="w-4 h-4 text-sky-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-300">Live AI Vision</span>
              <span className="text-[9px] text-slate-500">Bounding Boxes</span>
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
              <Shield className="w-4 h-4 text-red-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-300">Weapon Alert</span>
              <span className="text-[9px] text-slate-500">Gun / Knife / Rifle</span>
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
              <Radio className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-300">AXIS & RTSP</span>
              <span className="text-[9px] text-slate-500">ONVIF / IP Feeds</span>
            </div>
          </div>

          {/* Progress Bar & Status */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                {statusText}
              </span>
              <span className="font-mono text-sky-400">{progress}%</span>
            </div>

            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-500 via-amber-400 to-red-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Skip Button */}
          <button
            id="splash-skip-btn"
            onClick={onComplete}
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-3 rounded hover:bg-slate-800"
          >
            <span>Skip Initialization</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Footer info */}
        <div className="absolute bottom-4 text-center text-[11px] text-slate-600">
          KRISHNA LAB SOLUTIONS &copy; 2026 &bull; Advanced AI Threat Intelligence Platform
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
