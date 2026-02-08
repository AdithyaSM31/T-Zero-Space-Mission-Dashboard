"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler, Weight, Database, ExternalLink } from "lucide-react";
import type { UnifiedRocket } from "@/lib/api";

interface RocketModalProps {
  rocket: UnifiedRocket | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RocketModal({ rocket, isOpen, onClose }: RocketModalProps) {
  if (!rocket) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 overflow-y-auto"
          >
            {/* Modal Content */}
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Image Section */}
                  <div className="relative h-64 md:h-auto bg-black">
                    {rocket.image_url ? (
                         <img
                          src={rocket.image_url}
                          alt={rocket.name}
                          className="w-full h-full object-cover opacity-90"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent md:bg-gradient-to-r" />
                    <div className="absolute bottom-6 left-6">
                        <h2 className="text-3xl font-bold text-white mb-2">{rocket.name}</h2>
                        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-sm font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                            {rocket.manufacturer.name}
                        </span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {rocket.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-blue-400 mb-1">
                                <Ruler className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Height</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{rocket.length} m</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-blue-400 mb-1">
                                <Weight className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Mass</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{rocket.launch_mass} t</p>
                        </div>
                         <div className="space-y-1">
                            <div className="flex items-center gap-2 text-blue-400 mb-1">
                                <Database className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Payload to LEO</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{rocket.leo_capacity} kg</p>
                        </div>
                         <div className="space-y-1">
                            <div className="flex items-center gap-2 text-blue-400 mb-1">
                                <Ruler className="w-4 h-4 rotate-90" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Diameter</span>
                            </div>
                            <p className="text-2xl font-bold text-white">{rocket.diameter} m</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                         <h3 className="text-lg font-semibold text-white mb-4">Performance Stats</h3>
                         <div className="bg-white/5 rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-white">{rocket.total_launch_count}</div>
                                <div className="text-xs text-gray-400 mt-1">Total Flights</div>
                            </div>
                             <div>
                                <div className="text-2xl font-bold text-emerald-400">{rocket.successful_launches}</div>
                                <div className="text-xs text-gray-400 mt-1">Successful</div>
                            </div>
                             <div>
                                <div className="text-2xl font-bold text-amber-400">{rocket.failed_launches}</div>
                                <div className="text-xs text-gray-400 mt-1">Failed</div>
                            </div>
                         </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        {rocket.wiki_url && (
                             <a 
                                href={rocket.wiki_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" /> Wikipedia
                             </a>
                        )}
                        {rocket.info_url && (
                             <a 
                                href={rocket.info_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" /> Official Info
                             </a>
                        )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
