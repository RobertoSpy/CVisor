import Link from "next/link";
import { Opportunity } from "./types";
import { useEffect, useRef, useState } from "react";

type Props = {
  opportunity: Opportunity;
  onEdit: (opp: Opportunity) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
};

export default function OpportunityCard({ opportunity: opp, onEdit, onDelete, readOnly }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile/touch device
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    setIsMobile(mq.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    // Mobile: Autoplay on scroll/intersection
    // FIX: Don't check !opp.banner_image anymore since Video has priority
    if (!isMobile || !videoRef.current || !opp.promo_video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => { });
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.6 } // 60% visible
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [isMobile, opp.promo_video]);

  const handleMouseEnter = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.play().catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset to start
    }
  };

  // Gradient și mesaje pentru fallback
  const fallbackBanner = () => {
    if (opp.type === "party") {
      return (
        <div className="w-full flex justify-center mb-4">
          <div className="w-full max-w-[400px] h-40 rounded-xl bg-gradient-to-r from-pink-500 via-yellow-400 to-pink-400 flex flex-col items-center justify-center">
            <span className="text-5xl mb-2 animate-bounce">🎉</span>
            <span className="text-xl font-bold text-white drop-shadow">Party Time!</span>
            <span className="text-xs font-semibold text-white/80 mt-1">Let’s celebrate together!</span>
          </div>
        </div>
      );
    }
    if (opp.type === "self-development") {
      return (
        <div className="w-full flex justify-center mb-4">
          <div className="w-full max-w-[400px] h-40 rounded-xl bg-gradient-to-r from-blue-500 via-green-400 to-purple-400 flex flex-col items-center justify-center">
            <span className="text-5xl mb-2 animate-pulse">🧠</span>
            <span className="text-xl font-bold text-white drop-shadow">Level Up!</span>
            <span className="text-xs font-semibold text-white/80 mt-1">Self-growth in progress…</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <li className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow flex flex-col justify-between relative overflow-visible">
      {/* Video sau Banner sau Fallback */}
      {opp.promo_video ? (
        <div
          className="w-full flex justify-center mb-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <video
            ref={videoRef}
            src={opp.promo_video}
            className="object-cover rounded-xl max-h-48 w-full bg-black"
            muted
            loop
            playsInline
            style={{ maxWidth: "400px" }}
          />
        </div>
      ) : opp.banner_image ? (
        <div className="w-full flex justify-center mb-4">
          <img
            src={opp.banner_image}
            alt={opp.title}
            className="object-cover rounded-xl max-h-48 w-full"
            style={{ maxWidth: "400px" }}
          />
        </div>
      ) : (
        fallbackBanner()
      )}

      {/* Titlu & descriere */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
          <Link href={readOnly ? `/organization/explore/${opp.id}` : `/organization/opportunities/${opp.id}`}>
            {opp.title}
          </Link>
        </h3>
        {opp.organization_name && (
          <div className="text-sm font-bold text-blue-600 mb-2">
            {opp.organization_name}
          </div>
        )}
        {opp.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{opp.description}</p>}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
        {Array.isArray(opp.skills) &&
          opp.skills.map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium"
            >
              {s}
            </span>
          ))}
      </div>

      {/* Acțiuni */}
      {!readOnly && (
        <div className="mt-4 flex gap-3 justify-center">
          <button
            className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-md hover:shadow-lg text-sm font-bold flex items-center justify-center gap-2"
            onClick={() => onEdit(opp)}
          >
            ✏️ Editează
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-xl bg-white text-red-500 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 transition shadow-sm text-sm font-bold flex items-center justify-center gap-2"
            onClick={() => onDelete(opp.id)}
          >
            🗑️ Șterge
          </button>
        </div>
      )}
    </li>
  );
}