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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 rounded-xl shadow-sm p-5 border border-primary/10 animate-fade-in">
            <h3 className="text-primary font-bold mb-2 flex items-center gap-2"><FaListUl /> Agenda</h3>
            <div className="text-gray-700 text-sm">
              {opp.agenda
                ? typeof opp.agenda === "object"
                  ? opp.agenda.text ?? JSON.stringify(opp.agenda)
                  : opp.agenda
                : <span className="italic text-gray-400">-</span>}
            </div>
          </div>
          <div className="bg-white/70 rounded-xl shadow-sm p-5 border border-primary/10 animate-fade-in">
            <h3 className="text-primary font-bold mb-2 flex items-center gap-2"><FaListUl /> FAQ</h3>
            <div className="text-gray-700 text-sm">
              {opp.faq
                ? Array.isArray(opp.faq)
                  ? opp.faq.map((item: any, i: number) => <div key={i} className="mb-1">{item.text ?? JSON.stringify(item)}</div>)
                  : typeof opp.faq === "object"
                    ? opp.faq.text ?? JSON.stringify(opp.faq)
                    : opp.faq
                : <span className="italic text-gray-400">-</span>}
            </div>
          </div>
          <div className="bg-white/70 rounded-xl shadow-sm p-5 border border-primary/10 animate-fade-in">
            <h3 className="text-primary font-bold mb-2 flex items-center gap-2"><FaStar className="text-yellow-500" /> Reviews</h3>
            <div className="text-gray-700 text-sm">
              {opp.reviews
                ? Array.isArray(opp.reviews)
                  ? opp.reviews.map((item: any, i: number) => <div key={i} className="mb-1">{item.text ?? JSON.stringify(item)}</div>)
                  : typeof opp.reviews === "object"
                    ? opp.reviews.text ?? JSON.stringify(opp.reviews)
                    : opp.reviews
                : <span className="italic text-gray-400">-</span>}
            </div>
          </div>
        </div>

        {/* Galerie */}

        {opp.gallery && Array.isArray(opp.gallery) && opp.gallery.length > 0 && (
          <div className="mb-8">
            <h3 className="text-primary font-bold mb-3 flex items-center gap-2"><FaListUl /> Galerie</h3>
            <div className="flex gap-2 flex-wrap">
              {opp.gallery.map((url: string, i: number) => (
                <img
                  key={url + i}
                  src={url}
                  alt={`galerie-full-${i}`}
                  className="w-32 h-32 object-cover rounded-lg shadow hover:scale-105 transition-all duration-200 border border-primary/20"
                />
              ))}
            </div>
          </div>
        )}
        {typeof opp.gallery === "string" && opp.gallery.length > 0 && (
          <div className="mb-8">
            <h3 className="text-primary font-bold mb-3 flex items-center gap-2"><FaListUl /> Galerie</h3>
            <div className="flex gap-2 flex-wrap">
              {opp.gallery.split(",").map((url: string, i: number) => (
                <img
                  key={url.trim() + i}
                  src={url.trim()}
                  alt={`galerie-full-${i}`}
                  className="w-32 h-32 object-cover rounded-lg shadow hover:scale-105 transition-all duration-200 border border-primary/20"
                />
              ))}
            </div>
          </div>
        )}

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
