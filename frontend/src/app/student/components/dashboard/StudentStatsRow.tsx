import React from "react";
import Link from "next/link";
import Stat from "./Stat";
import { DASHBOARD_STRINGS } from "../../constants";

interface StudentStatsRowProps {
  points: number;
  badgesCount: number;
  bestBadge: { label: string; emoji: string } | null;
}

export default function StudentStatsRow({ points, badgesCount, bestBadge }: StudentStatsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <Stat title={DASHBOARD_STRINGS.STATS_POINTS} value={points} />
      <Stat title={DASHBOARD_STRINGS.STATS_BADGES} value={badgesCount} />
      <Stat
        title={DASHBOARD_STRINGS.STATS_CURRENT_BADGE}
        value={
          bestBadge
            ? `${bestBadge.label} ${bestBadge.emoji}`
            : DASHBOARD_STRINGS.NO_BP_BADGE
        }
      />
      <Link
        href="/student/map"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-900 to-blue-500 text-white hover:opacity-90 px-4 py-2 rounded transition shadow-md"
      >
        {DASHBOARD_STRINGS.MAP_LINK}
      </Link>
    </div>
  );
}
