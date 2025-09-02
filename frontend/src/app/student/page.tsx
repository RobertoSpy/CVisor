"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

/** ————— mici utilitare ————— */
function classNames(...x: (string | false | null | undefined)[]) {
  return x.filter(Boolean).join(" ");
}
function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ————— card statistic scurt ————— */
function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-0.5 tracking-tight">{value}</div>
    </div>
  );
}

/** ————— HEATMAP: prezență în aplicație (stil GitHub) ————— */
function ActivityHeatmap({
  title = "Prezență în aplicație (ultimele 35 zile)",
  data,
  days = 35,
}: {
  title?: string;
  data: Record<string, number>;
  days?: number;
}) {
  const cells = useMemo(() => {
    const arr: { date: string; value: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = fmtDate(d);
      arr.push({ date: key, value: data[key] || 0 });
    }
    return arr;
  }, [data, days]);

  const level = (v: number) => {
    if (v === 0) return 0;
    if (v < 2) return 1;
    if (v < 4) return 2;
    if (v < 7) return 3;
    return 4;
  };

  // împărțim în coloane (săptămâni) cu câte 7 rânduri
  const weeks: { date: string; value: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <span className="text-xs text-gray-500">date/zi</span>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {w.map((c, ci) => (
              <div
                key={c.date + "-" + ci}
                title={`${c.date}: ${c.value} vizite`}
                aria-label={`${c.date}: ${c.value} vizite`}
                className={classNames(
                  "w-3.5 h-3.5 rounded-[4px]",
                  [
                    "bg-indigo-50", // 0
                    "bg-emerald-200",
                    "bg-emerald-400",
                    "bg-emerald-600",
                    "bg-emerald-700",
                  ][level(c.value)]
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** ————— BAR CHART: postări organizații / săptămână ————— */
function OrgPostsBar({
  title = "Postări organizații / săptămână",
  data,
  height = 180,
}: {
  title?: string;
  data: { label: string; value: number }[];
  height?: number;
}) {
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);
  const barW = 26;
  const gap = 10;
  const width = data.length * barW + (data.length - 1) * gap + 24;

  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <span className="text-xs text-gray-500">ultimele {data.length} săpt.</span>
      </div>

      <div className="w-full overflow-x-auto" style={{ height }}>
        <svg width={width} height={height} role="img" aria-label="Postări organizații">
          {data.map((d, i) => {
            const h = Math.round((d.value / max) * (height - 44)); // padding jos pentru labels
            const x = 12 + i * (barW + gap);
            const y = height - 26 - h;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={h} rx="7" className="fill-amber-400" />
                <text x={x + barW / 2} y={height - 10} textAnchor="middle" fontSize="10" className="fill-gray-600">
                  {d.label}
                </text>
                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="10" className="fill-gray-700">
                  {d.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/** ————— pagina dashboard student ————— */
export default function StudentHome() {

    
  const API =  "http://localhost:5000";
  const STUDENT_ANALYTICS = `${API}/api/analytics/student`;
  const ORG_ANALYTICS     = `${API}/api/analytics/orgs`;


  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [orgBars, setOrgBars] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    // 0) marchează pageview la intrarea pe dashboard
    fetch(`${STUDENT_ANALYTICS}/pageview`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    }).catch(() => { /* nu blocăm UI dacă pică log-ul */ });

    // 1) presence (login + pageview) pe ultimele 35 zile – pt. heatmap
    (async () => {
      try {
        const res = await fetch(`${STUDENT_ANALYTICS}/presence?days=35`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        });
        if (!res.ok) throw new Error("fallback");
        const payload = await res.json();
        setHeatmapData(payload || {});
      } catch {
        // MOCK până când backend-ul răspunde
        const mock: Record<string, number> = {};
        const today = new Date();
        for (let i = 0; i < 35; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          mock[fmtDate(d)] = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 6);
        }
        setHeatmapData(mock);
      }
    })();

    // 2) postări organizații pe ultimele 8 săptămâni – pt. barchart
    (async () => {
      try {
        const res = await fetch(`${ORG_ANALYTICS}/posts?weeks=8`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        });
        if (!res.ok) throw new Error("fallback");
        const payload = await res.json();
        setOrgBars(payload || []);
      } catch {
        const labels = ["-7", "-6", "-5", "-4", "-3", "-2", "-1", "azi"];
        setOrgBars(labels.map((l) => ({ label: l, value: Math.floor(Math.random() * 9) })));
      }
    })();
  }, [STUDENT_ANALYTICS, ORG_ANALYTICS]);

  return (
    <div className="space-y-8 mt-10">
      {/* statistici rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Stat title="Puncte" value={120} />
        <Stat title="Badge-uri" value={3} />
        <Stat title="Aplicații" value={2} />
        <Stat title="Recomandate" value={5} />
      </div>

      {/* 2 grafice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityHeatmap data={heatmapData} />
        <OrgPostsBar data={orgBars} />
      </div>

      {/* recomandate */}
      
    <section className="bg-card rounded-2xl p-6 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <h2 className="text-lg font-semibold tracking-tight mb-2">Oportunități recomandate</h2>
      <p className="text-sm text-gray-600 mb-4">Vezi lista completă și aplică rapid.</p>

      <Link
        href="/student/opportunities"
        className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-accent transition shadow"
      >
        Vezi oportunități <span>→</span>
      </Link>
    </section>
    </div>
  );
}
