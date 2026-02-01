"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaMoneyBillWave, FaListUl, FaStar, FaPlay } from "react-icons/fa";

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
        setOpp(data.opportunity ?? data); // suportă ambele forme

      })
      .catch((e) => { console.error("Fetch error:", e); setOpp(null); })
      .finally(() => setLoading(false))
      ;
  }, [id]);

  if (loading) return <div className="p-8 text-center text-lg animate-pulse">Se încarcă...</div>;
  if (!opp) return <div className="p-8 text-center text-lg text-red-500">Oportunitatea nu a fost găsită.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-12 bg-gradient-to-br from-white via-blue-50 to-violet-100 p-0 rounded-3xl shadow-2xl overflow-hidden">
      {/* Banner */}
      <div className="relative">
        {opp.banner_image ? (
          <img src={opp.banner_image} alt="banner" className="w-full h-64 object-cover" />
        ) : (
          <div className="h-64 w-full flex items-center justify-center bg-gradient-to-r from-primary to-accent text-white text-3xl font-bold">
            Oportunitate
          </div>
        )}
        <Link href="/student/opportunities" className="absolute top-5 left-5 bg-white/80 backdrop-blur px-4 py-2 text-primary rounded-full shadow hover:bg-white transition text-sm font-semibold border border-primary">
          &larr; Înapoi la listă
        </Link>
        <div className="absolute bottom-6 left-6 bg-primary/90 rounded-xl px-5 py-2 text-white font-bold text-2xl shadow-lg drop-shadow tracking-tight animate-fade-in">
          {opp.title}
        </div>
      </div>

      {/* Detalii principale */}
      <div className="p-8 pt-4">
        <div className="flex gap-6 flex-wrap mb-5">
          <div className="flex items-center gap-2 text-secondary">
            <FaListUl className="text-primary" />
            <span className="font-semibold">{opp.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-primary" />
            <span>{opp.deadline ? new Date(opp.deadline).toLocaleDateString() : '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary" />
            <span>{opp.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-green-600" />
            <span className="font-semibold">{opp.price} RON</span>
          </div>
          <div className="flex items-center gap-2">
            <FaUsers className="text-primary" />
            <span>Locuri: <span className="font-bold">{opp.available_spots}</span></span>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {Array.isArray(opp.skills) && opp.skills.map((s: string, i: number) => (
            <span key={i} className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-violet-200 via-blue-200 to-primary text-primary font-semibold shadow-sm border border-primary/20 animate-fade-in">
              {s}
            </span>
          ))}
        </div>

        {/* Descriere */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
            <FaListUl /> Descriere
          </h2>
          <p className="text-gray-700 text-base leading-relaxed">{opp.description}</p>
        </div>

        {/* Agenda, FAQ, Reviews - secțiuni creative */}
        {/* Agenda & FAQ - Vertical Full Width Layout */}
        <div className="flex flex-col gap-8 mb-10 w-full">
          {/* Agenda */}
          <div className="bg-white/80 rounded-2xl shadow-sm p-6 border border-primary/10 animate-fade-in w-full">
            <h3 className="text-primary text-xl font-bold mb-4 flex items-center gap-2 border-b border-primary/10 pb-2">
              <FaListUl /> Agenda
            </h3>
            <div className="flex flex-col gap-4 w-full">
              {opp.agenda ? (
                Array.isArray(opp.agenda) ? (
                  opp.agenda.map((item: any, i: number) => (
                    <div key={i} className="w-full bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">
                      <div className="font-bold text-secondary text-lg min-w-[100px] flex-shrink-0 border-r md:border-r-0 md:border-b border-gray-100 pb-2 md:pb-0 md:pr-4">
                        {item.time || `Etapa ${i + 1}`}
                      </div>
                      <div className="text-gray-700 text-base leading-relaxed break-words whitespace-pre-wrap flex-grow">
                        <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                        {item.text || item.description || (typeof item === 'string' ? item : JSON.stringify(item))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-700 text-base leading-relaxed break-words whitespace-pre-wrap bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    {typeof opp.agenda === "object" ? opp.agenda.text ?? JSON.stringify(opp.agenda) : opp.agenda}
                  </div>
                )
              ) : (
                <div className="text-gray-400 italic p-4 text-center bg-gray-50 rounded-xl">Nu există agendă specificată.</div>
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white/80 rounded-2xl shadow-sm p-6 border border-primary/10 animate-fade-in w-full">
            <h3 className="text-primary text-xl font-bold mb-4 flex items-center gap-2 border-b border-primary/10 pb-2">
              <FaListUl /> Întrebări Frecvente (FAQ)
            </h3>
            <div className="flex flex-col gap-4 w-full">
              {opp.faq ? (
                Array.isArray(opp.faq) ? (
                  opp.faq.map((item: any, i: number) => (
                    <div key={i} className="w-full bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      {item.question && (
                        <div className="font-bold text-gray-900 text-lg mb-2 flex items-start gap-2">
                          <span className="text-secondary">Q:</span>
                          <span className="break-words">{item.question}</span>
                        </div>
                      )}
                      <div className="text-gray-700 text-base leading-relaxed break-words whitespace-pre-wrap pl-6 border-l-2 border-secondary/20">
                        {item.answer || item.text || JSON.stringify(item)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-700 text-base leading-relaxed break-words whitespace-pre-wrap bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    {typeof opp.faq === "object" ? opp.faq.text ?? JSON.stringify(opp.faq) : opp.faq}
                  </div>
                )
              ) : (
                <div className="text-gray-400 italic p-4 text-center bg-gray-50 rounded-xl">Nu există întrebări frecvente.</div>
              )}
            </div>
          </div>
        </div>

        {/* Galerie */}



        {/* Video promo */}
        {opp.promo_video && (
          <div className="mb-8">
            <div className="font-bold mb-2 text-primary text-lg">Check this out</div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center aspect-video max-w-xl mx-auto">
              <video
                controls
                src={opp.promo_video}
                className="w-full h-full object-contain"
                style={{ maxHeight: "400px", maxWidth: "100%" }}
              >
                Video promo
              </video>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          {opp.cta_url ? (
            <a
              href={opp.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white font-bold px-8 py-3 rounded-2xl shadow-lg text-lg transition-all duration-200 hover:scale-105"
            >
              Aplică acum și descoperă oportunitatea!
            </a>
          ) : (
            <button
              className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white font-bold px-8 py-3 rounded-2xl shadow-lg text-lg transition-all duration-200 hover:scale-105"
              disabled
              title="Momentan nu poți aplica direct"
            >
              Aplică acum și descoperă oportunitatea!
            </button>
          )}
          <div className="mt-2 text-xs text-gray-500">
            {opp.cta_url
              ? "* Vei fi redirecționat către pagina oficială a organizației."
              : "* Pentru mai multe detalii, contactează organizația."}
          </div>
        </div>
      </div>
    </div>
  );
}
