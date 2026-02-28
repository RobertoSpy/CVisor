"use client";

import { useEffect, useState } from "react";
import ApiClient from "../../lib/api/client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatsData {
  stats: {
    totalStudents: number;
    totalOrganizations: number;
    opportunitiesToday: number;
    loginsToday: number;
  };
  recentOpportunities: any[];
  recentUsers: any[];
  chartData: {
    date: string;
    student_signups: number;
    org_signups: number;
    student_logins: number;
    org_logins: number;
    opp_count: number;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOppId, setSelectedOppId] = useState<number | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await ApiClient.get<StatsData>("/api/admin/stats/dashboard");
      setData(res);
    } catch (err: any) {
      setError(err.message || "Eroare la încărcarea statisticilor.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center py-10">Se încarcă...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!data) return null;

  const labels = data.chartData.map(d =>
    new Date(d.date).toLocaleDateString("ro-RO", { weekday: 'short', day: 'numeric', month: 'short' })
  );

  return (
    <div className="flex flex-col gap-8">
      {/* 4 Cards Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Studenți" value={data.stats.totalStudents} color="bg-blue-500" icon="👨‍🎓" />
        <StatCard title="Organizații" value={data.stats.totalOrganizations} color="bg-green-500" icon="🏢" />
        <StatCard title="Oportunități Azi" value={data.stats.opportunitiesToday} color="bg-purple-500" icon="🚀" />
        <StatCard title="Logări Azi" value={data.stats.loginsToday} color="bg-orange-500" icon="🔐" />
      </div>

      {/* 3 Grafice Separate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafic 1: Logări Zilnice */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-lg">📊</span>
            Logări Zilnice
          </h3>
          <div className="h-56">
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: 'Studenți',
                    data: data.chartData.map(d => d.student_logins),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#3b82f6',
                    borderWidth: 2.5,
                  },
                  {
                    label: 'Organizații',
                    data: data.chartData.map(d => d.org_logins),
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.08)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#22c55e',
                    borderWidth: 2.5,
                  },
                ]
              }}
              options={chartOptions('logări')}
            />
          </div>
        </div>

        {/* Grafic 2: Conturi Noi */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-lg">👤</span>
            Conturi Noi
          </h3>
          <div className="h-56">
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: 'Studenți',
                    data: data.chartData.map(d => d.student_signups),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#8b5cf6',
                    borderWidth: 2.5,
                  },
                  {
                    label: 'Organizații',
                    data: data.chartData.map(d => d.org_signups),
                    borderColor: '#14b8a6',
                    backgroundColor: 'rgba(20, 184, 166, 0.08)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#14b8a6',
                    borderWidth: 2.5,
                  },
                ]
              }}
              options={chartOptions('conturi noi')}
            />
          </div>
        </div>

        {/* Grafic 3: Oportunități Postate */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-lg">🚀</span>
            Oportunități Postate
          </h3>
          <div className="h-56">
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: 'Oportunități',
                    data: data.chartData.map(d => d.opp_count),
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#f97316',
                    borderWidth: 2.5,
                  },
                ]
              }}
              options={chartOptions('oportunități')}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ultimele Oportunități */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Ultimele Oportunități</h2>
          {data.recentOpportunities.length === 0 ? (
            <p className="text-gray-500 text-sm">Nicio oportunitate recentă.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.recentOpportunities.map((opp) => (
                <button
                  key={opp.id}
                  onClick={() => setSelectedOppId(opp.id)}
                  className="w-full text-left p-3 border rounded-xl hover:bg-gray-50 transition group"
                >
                  <div className="font-semibold text-gray-800 group-hover:text-red-700 transition">{opp.title}</div>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>{opp.org_name}</span>
                    <span>{new Date(opp.created_at).toLocaleDateString("ro-RO")}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ultimii Utilizatori */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Conturi Noi</h2>
          {data.recentUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">Niciun cont nou.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.recentUsers.map((user) => (
                <div key={user.id} className="p-3 border rounded-xl hover:bg-gray-50 transition flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-800">{user.full_name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${user.role === 'student' ? 'bg-blue-100 text-blue-700' : user.role === 'organization' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString("ro-RO")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal detalii oportunitate */}
      {selectedOppId && (
        <OppDetailModal
          oppId={selectedOppId}
          onClose={() => setSelectedOppId(null)}
        />
      )}
    </div>
  );
}

/* ─── Chart Options Helper ─── */
function chartOptions(unitLabel: string): any {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, boxHeight: 6, font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: (items: any) => items[0]?.label || '',
          label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.y} ${unitLabel}`,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, font: { size: 10 } },
        grid: { color: 'rgba(0,0,0,0.04)' }
      },
      x: {
        ticks: { font: { size: 10 } },
        grid: { display: false }
      }
    }
  };
}

/* ─── Stat Card ─── */
function StatCard({ title, value, color, icon }: { title: string; value: number; color: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color} bg-opacity-10`}>
        {icon}
      </div>
      <div>
        <div className="text-gray-500 text-sm font-medium">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

/* ─── Opportunity Detail Modal ─── */
function OppDetailModal({ oppId, onClose }: { oppId: number; onClose: () => void }) {
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.get<any>(`/api/admin/users/opportunities/${oppId}`)
      .then(res => setOpp(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [oppId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Detalii Oportunitate</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {loading ? (
            <p className="text-center text-gray-500 py-10">Se încarcă...</p>
          ) : !opp ? (
            <p className="text-center text-red-500 py-10">Oportunitatea nu a fost găsită.</p>
          ) : (
            <>
              {/* Banner */}
              {opp.banner_image && (
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <img src={opp.banner_image} alt={opp.title} className="w-full h-auto max-h-[300px] object-cover" />
                </div>
              )}

              {/* Title & Meta */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{opp.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs uppercase">{opp.type}</span>
                  {opp.org_name && <span className="flex items-center gap-1">🏢 {opp.org_name}</span>}
                  {opp.location && <span className="flex items-center gap-1">📍 {opp.location}</span>}
                  {opp.deadline && (
                    <span className="flex items-center gap-1">
                      📅 {new Date(opp.deadline).toLocaleDateString("ro-RO", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {opp.price !== undefined && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                    <div className="text-xs text-gray-500 mb-1">Preț</div>
                    <div className="font-bold text-gray-900">{opp.price > 0 ? `${opp.price} RON` : 'Gratuit'}</div>
                  </div>
                )}
                {opp.available_spots !== undefined && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                    <div className="text-xs text-gray-500 mb-1">Locuri</div>
                    <div className="font-bold text-gray-900">{opp.available_spots}</div>
                  </div>
                )}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                  <div className="text-xs text-gray-500 mb-1">Creat la</div>
                  <div className="font-bold text-gray-900 text-sm">{new Date(opp.created_at).toLocaleDateString("ro-RO")}</div>
                </div>
              </div>

              {/* Description */}
              {opp.description && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Descriere</h4>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{opp.description}</div>
                </div>
              )}

              {/* Skills */}
              {opp.skills && opp.skills.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Abilități</h4>
                  <div className="flex flex-wrap gap-2">
                    {opp.skills.map((s: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {opp.tags && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {(typeof opp.tags === 'string' ? opp.tags.split(',') : Array.isArray(opp.tags) ? opp.tags : []).map((t: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">#{t.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Agenda */}
              {opp.agenda && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Agendă</h4>
                  {Array.isArray(opp.agenda) ? (
                    <div className="space-y-2">
                      {opp.agenda.map((item: any, i: number) => (
                        <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                          <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</span>
                          <div>
                            <span className="font-medium text-gray-800">{item.time || `Etapa ${i + 1}`}</span>
                            <span className="text-gray-600 ml-2">{item.title || item.text || (typeof item === 'string' ? item : '')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-xl">{typeof opp.agenda === 'object' ? (opp.agenda as any).text : opp.agenda}</p>
                  )}
                </div>
              )}

              {/* FAQ */}
              {opp.faq && (Array.isArray(opp.faq) ? opp.faq.length > 0 : !!opp.faq) && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">FAQ</h4>
                  {Array.isArray(opp.faq) ? opp.faq.map((item: any, i: number) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 mb-2">
                      <div className="font-semibold text-gray-900 mb-1">{item.question}</div>
                      <div className="text-gray-600 text-sm">{item.answer || item.text}</div>
                    </div>
                  )) : (
                    <p className="text-gray-600 text-sm">{typeof opp.faq === 'object' ? (opp.faq as any).text : opp.faq}</p>
                  )}
                </div>
              )}

              {/* Video Promo */}
              {opp.promo_video && (
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Video Promo</h4>
                  <div className="bg-black rounded-xl overflow-hidden aspect-video">
                    <video src={opp.promo_video} controls className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              {/* CTA URL */}
              {opp.cta_url && (
                <div className="pt-2">
                  <a href={opp.cta_url} target="_blank" rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-md">
                    Deschide Link Aplicare →
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}