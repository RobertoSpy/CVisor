"use client";
import Link from "next/link";
import { Opportunity } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

type Props = {
  opportunity: Opportunity;
};

export default function StudentOpportunityCard({ opportunity: opp }: Props) {
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

  return (
    <li className={`bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] flex flex-col justify-between relative ${opp.status === 'expired' ? 'opacity-75' : ''}`}>
      {/* Badge Expirat */}
      {opp.status === 'expired' && (
        <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
          Expirat
        </div>
      )}
      {/* Imagine banner sau Video */}
      {/* Video sau Banner */}
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
      ) : null}
      <h3 className="text-lg font-semibold tracking-tight mt-0.5 text-primary">
        <Link href={`/student/opportunities/${opp.id}`}>{opp.title}</Link>
      </h3>

      {opp.orgName && (
        <div className="text-sm font-medium text-gray-500 mb-1">
          {opp.orgName}
        </div>
      )}

      <div className="text-xs mt-1">
        Tip: <span className="font-medium text-secondary">{opp.type}</span>
      </div>
      <div className="text-xs mt-1 text-gray-600">
        Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "-"}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {Array.isArray(opp.skills) &&
          opp.skills.map((s, i) => (
            <span key={s + i} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
              {s}
            </span>
          ))}
      </div>
      {/* Fără Editează/Șterge pentru student */}
    </li>
  );
}
