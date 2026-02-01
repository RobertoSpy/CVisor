import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardCard from "./DashboardCard";
import { DASHBOARD_STRINGS } from "../../constants";

export default function TodaysOpportunities() {
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/opportunities?period=today", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOpps(data.slice(0, 5)); // Top 5
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-500">{DASHBOARD_STRINGS.LOADING_OPPS}</div>;

  if (opps.length === 0) {
    return (
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-2">{DASHBOARD_STRINGS.NO_OPPS_TITLE}</h2>
        <p className="text-gray-500 text-sm">{DASHBOARD_STRINGS.NO_OPPS_MESSAGE}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-bold text-gray-800">{DASHBOARD_STRINGS.OPPS_HEADER}</h2>
        <Link href="/student/opportunities" className="text-sm text-primary font-semibold hover:underline">
          {DASHBOARD_STRINGS.VIEW_ALL}
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {opps.map((opp) => (
          <DashboardCard key={opp.id} opp={opp} />
        ))}
      </div>
    </section>
  );
}
