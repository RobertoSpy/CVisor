"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaMoneyBillWave, FaListUl, FaStar, FaPlay, FaClock, FaCheckCircle, FaArrowLeft } from "react-icons/fa";

export default function StudentOpportunityDetailPage() {
  const { id } = useParams();
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const theId = Array.isArray(id) ? id[0] : id;
    fetch(`/api/opportunities/${theId}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setOpp(data.opportunity ?? data);
      })
      .catch((e) => { console.error("Fetch error:", e); setOpp(null); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!opp) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Oportunitatea nu a fost găsită</h2>
      <Link href="/student/opportunities" className="text-blue-600 hover:underline">
        Înapoi la oportunități
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation & Header */}
        <div className="mb-8">
          <Link
            href="/student/opportunities"
            className="group inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 font-medium"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Înapoi la oportunități
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <div className="flex gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
                  {opp.type}
                </span>
                {opp.deadline && (
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${new Date(opp.deadline) > new Date()
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-red-100 text-red-700 border-red-200"
                    }`}>
                    {new Date(opp.deadline) > new Date() ? "Activ" : "Expirat"}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                {opp.title}
              </h1>
            </div>

            {/* Metadata Summary */}
            <div className="flex flex-wrap gap-6 text-gray-600 font-medium text-sm md:text-base bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-500" />
                {opp.location}
              </div>
              <div className="w-px h-6 bg-gray-200 hidden md:block" />
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                {opp.deadline ? new Date(opp.deadline).toLocaleDateString("ro-RO", { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Banner Image - Fully Visible */}
            <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {opp.banner_image ? (
                <img
                  src={opp.banner_image}
                  alt={opp.title}
                  className="w-full h-auto max-h-[500px] object-contain rounded-2xl bg-gray-50"
                />
              ) : (
                <div className="w-full h-[300px] rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-200">
                  <FaStar size={64} />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="p-2 rounded-lg bg-blue-50 text-blue-600"><FaListUl /></span>
                Despre Oportunitate
              </h2>
              <div className="prose prose-lg text-gray-600 max-w-none leading-relaxed whitespace-pre-line">
                {opp.description}
              </div>

              {/* Tags */}
              {opp.tags && opp.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {typeof opp.tags === 'string'
                      ? opp.tags.split(',').map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-md bg-gray-50 text-gray-600 text-sm font-medium border border-gray-100">#{tag.trim()}</span>
                      ))
                      : Array.isArray(opp.tags) && opp.tags.map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-md bg-gray-50 text-gray-600 text-sm font-medium border border-gray-100">#{tag}</span>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Video Promo (Before Agenda) */}
            {opp.promo_video && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-red-50 text-red-600"><FaPlay /></span>
                  Video Promo
                </h3>
                <div className="bg-black rounded-2xl overflow-hidden shadow-lg aspect-video relative group">
                  <video
                    src={opp.promo_video}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Agenda */}
            {opp.agenda && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-purple-50 text-purple-600"><FaClock /></span>
                  Agendă & Program
                </h3>
                <div className="space-y-4">
                  {Array.isArray(opp.agenda) ? (
                    opp.agenda.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-purple-100 hover:shadow-sm transition-all">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shadow-sm">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-base mb-1">{item.time || `Etapa ${i + 1}`}</p>
                          <p className="text-gray-600 leading-relaxed">{item.title || item.text || (typeof item === 'string' ? item : '')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-line border border-gray-100">
                      {typeof opp.agenda === 'object' ? (opp.agenda as any).text : opp.agenda}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FAQ */}
            {opp.faq && (Array.isArray(opp.faq) ? opp.faq.length > 0 : !!opp.faq) && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-orange-50 text-orange-600"><FaCheckCircle /></span>
                  Întrebări Frecvente
                </h2>
                <div className="space-y-4">
                  {Array.isArray(opp.faq) ? opp.faq.map((item: any, i: number) => (
                    <div key={i} className="border border-gray-100 rounded-2xl p-6 hover:border-orange-200 hover:bg-orange-50/20 transition-all bg-white">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-3 text-lg">
                        <span className="text-orange-500 bg-orange-100 w-6 h-6 rounded-full flex items-center justify-center text-xs mt-1 shrink-0">?</span>
                        {item.question}
                      </h4>
                      <div className="pl-9 text-gray-600 leading-relaxed">{item.answer || item.text}</div>
                    </div>
                  )) : (
                    <p className="text-gray-600 p-4 border border-gray-100 rounded-2xl bg-gray-50">{typeof opp.faq === 'object' ? (opp.faq as any).text : opp.faq}</p>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Action Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-500/10 border border-blue-100 lg:sticky lg:top-8 transition-all hover:shadow-2xl hover:shadow-blue-500/15">
              <div className="text-center mb-8 relative">
                <div className="absolute top-0 right-0 p-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 block animate-pulse"></span>
                </div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Preț</p>
                <div className="text-5xl font-black text-gray-900 tracking-tight">
                  {opp.price > 0 ? `${opp.price} RON` : "Gratuit"}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3 text-gray-600 font-medium">
                    <FaUsers className="text-blue-500" /> Locuri total
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{opp.available_spots}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3 text-gray-600 font-medium">
                    <FaMapMarkerAlt className="text-blue-500" /> Locație
                  </div>
                  <span className="font-bold text-gray-900 text-right text-sm max-w-[50%] truncate" title={opp.location}>{opp.location}</span>
                </div>
              </div>

              {opp.cta_url ? (
                <div className="space-y-4">
                  <a
                    href={opp.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg text-center block shadow-lg shadow-blue-600/30 hover:shadow-xl hover:scale-[1.02] transition-all transform"
                  >
                    Aplică Acum
                  </a>
                  <p className="text-xs text-center text-gray-400">
                    Se deschide într-o filă nouă pe site-ul oficial.
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                  <p className="text-gray-500 font-medium text-sm">Înscrierile sunt momentan închise sau se fac direct la organizație.</p>
                </div>
              )}
            </div>

            {/* Skills Card */}
            {opp.skills && opp.skills.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                  <FaStar className="text-yellow-400" /> Abilități & Competențe
                </h3>
                <div className="flex flex-wrap gap-2">
                  {opp.skills.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
