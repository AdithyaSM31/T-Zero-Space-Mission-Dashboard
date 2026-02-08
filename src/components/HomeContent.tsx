"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Activity, TrendingUp, Radio, Globe, Zap } from "lucide-react";
import { InteractiveHoverButton } from "@/components/InteractiveHoverButton";

interface HomeStats {
  upcomingCount: number;
  ytdCount: number;
  activeRocketsCount: number;
  agenciesCount: number;
}

export function HomeContent({ stats }: { stats: HomeStats }) {
  const router = useRouter();

  return (
    <>
      {/* Hero Section */}
      <div className="px-6 py-16 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            The New Era of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Space Exploration</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300"
          >
            Your unified command center for the modern space race. 
            Track real-time missions, analyze launch data, and witness humanity's journey to the stars.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <InteractiveHoverButton onClick={() => router.push('/launch-center')}>
              Track Next Launch
            </InteractiveHoverButton>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-12 sm:pb-20">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:gap-y-16 text-center lg:grid-cols-4 sm:grid-cols-2">
          {[
            { id: 1, name: 'Active Agencies', value: stats.agenciesCount, icon: Globe },
            { id: 2, name: 'Upcoming Launches', value: stats.upcomingCount, icon: Radio },
            { id: 3, name: 'Total Launches (YTD)', value: stats.ytdCount, icon: TrendingUp },
            { id: 4, name: 'Active Rockets', value: stats.activeRocketsCount, icon: Zap },
          ].map((stat) => (
            <motion.div 
              key={stat.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: stat.id * 0.1 }}
              className="mx-auto flex max-w-xs flex-col gap-y-4 rounded-2xl bg-white/5 p-8 w-full border border-white/10 hover:border-blue-500/50 transition-colors backdrop-blur-sm"
            >
              <dt className="text-base leading-7 text-gray-400 flex items-center justify-center gap-2">
                <stat.icon className="h-5 w-5 text-blue-400" />
                {stat.name}
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {stat.value}
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </>
  );
}
