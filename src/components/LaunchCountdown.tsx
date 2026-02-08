"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface LaunchCountdownProps {
  targetDate: string;
  missionName: string;
  agency: string;
}

export function LaunchCountdown({ targetDate, missionName, agency }: LaunchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("T- 00:00:00");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `T- ${days}d ${hours.toString().padStart(2, "0")}h ${minutes
          .toString()
          .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!isClient) return <div className="text-3xl sm:text-4xl md:text-6xl font-mono text-blue-400 mb-2">Loading...</div>;

  return (
    <div className="bg-black/50 rounded-xl p-4 sm:p-8 text-center border border-white/5 backdrop-blur-sm">
      <div className="text-2xl sm:text-4xl md:text-6xl font-mono text-blue-400 mb-4 tracking-wider break-all sm:break-normal">
        {timeLeft || "Calculating..."}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl text-white font-semibold">{missionName}</h3>
        <p className="text-gray-400">{agency}</p>
        <div className="text-sm text-gray-500 mt-4">
            NET: {new Date(targetDate).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
