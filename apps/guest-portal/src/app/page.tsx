'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle,
  MessageSquare,
  Coffee,
  Map,
  Info,
  ArrowRight,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { useCheckInStore } from '@/lib/store/check-in';
import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/lib/store/language';
import { useTranslation } from '@/lib/i18n/dictionaries';
import { LanguageSelector } from '@/components/LanguageSelector';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const { isCheckedIn } = useCheckInStore();
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-6 pb-24 relative overflow-hidden bg-gray-50 text-gray-900">

      <header className="flex justify-between items-center mb-8 mt-4">
        <div>
          <h1 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{t.dashboard.welcome}</h1>
          <h2 className="text-3xl font-bold text-gray-900">
            {t.dashboard.title}
          </h2>
        </div>
        <LanguageSelector />
      </header>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4"
      >
        {/* Main Action Card - Check In */}
        {!isCheckedIn && (
          <motion.div variants={item} className="mb-2">
            <Link href="/check-in">
              <div className="bg-white rounded-2xl p-6 relative overflow-hidden group shadow-lg shadow-blue-500/10 border-2 border-blue-500 cursor-pointer">
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600 uppercase tracking-wider">
                      {t.dashboard.checkIn.required}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900">{t.dashboard.checkIn.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 font-medium">
                    {t.dashboard.checkIn.desc}
                  </p>
                  <div className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 w-fit px-4 py-2 rounded-lg">
                    {t.dashboard.checkIn.action} <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Dashboard Grid - Locked/Unlocked States */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={item} className={!isCheckedIn ? "opacity-50 pointer-events-none grayscale" : ""}>
            <Link href={isCheckedIn ? "/amenities" : "#"}>
              <div className="bg-white rounded-2xl p-5 h-full hover:bg-gray-50 transition-colors shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <Coffee className="w-6 h-6 text-orange-400" />
                  {!isCheckedIn && <Lock className="w-4 h-4 text-gray-400" />}
                </div>
                <h3 className="font-bold mb-1 text-gray-900">{t.dashboard.amenities.title}</h3>
                <p className="text-xs text-gray-500 font-medium">{t.dashboard.amenities.desc}</p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item} className={!isCheckedIn ? "opacity-50 pointer-events-none grayscale" : ""}>
            <Link href={isCheckedIn ? "/tourism" : "#"}>
              <div className="bg-white rounded-2xl p-5 h-full hover:bg-gray-50 transition-colors shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <Map className="w-6 h-6 text-green-500" />
                  {!isCheckedIn && <Lock className="w-4 h-4 text-gray-400" />}
                </div>
                <h3 className="font-bold mb-1 text-gray-900">{t.dashboard.guide.title}</h3>
                <p className="text-xs text-gray-500 font-medium">{t.dashboard.guide.desc}</p>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* AI Concierge Banner */}
        <motion.div variants={item} className={`mt-2 ${!isCheckedIn ? "opacity-50 pointer-events-none grayscale" : ""}`}>
          <Link href={isCheckedIn ? "/chat" : "#"}>
            <div className="bg-white rounded-2xl p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors shadow-sm border border-gray-100">
              <div className="p-3 bg-purple-100 rounded-full">
                {isCheckedIn ?
                  <MessageSquare className="w-5 h-5 text-purple-600" /> :
                  <Lock className="w-5 h-5 text-gray-400" />
                }
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{t.dashboard.chat.title}</h3>
                <p className="text-xs text-gray-500 font-medium">{t.dashboard.chat.desc}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </Link>
        </motion.div>

        {isCheckedIn && (
          <motion.div variants={item} className="mt-4 text-center space-y-4">
            <p className="text-xs text-gray-400">
              {t.dashboard.checkedInMessage}
            </p>

            <Link href="/check-out">
              <button className="glass-button px-6 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors shadow-sm text-sm flex items-center gap-2 mx-auto">
                {t.dashboard.checkOut?.title || "Check Out"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        )}

      </motion.div>
    </main>
  );
}
