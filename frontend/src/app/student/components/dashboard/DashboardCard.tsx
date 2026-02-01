import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { DASHBOARD_STRINGS } from "../../constants";

export default function DashboardCard({ opp }: { opp: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    setIsMobile(mq.matches);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isMobile || !videoRef.current || !opp.promo_video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) videoRef.current?.play().catch(() => { });
        else videoRef.current?.pause();
      },
      { threshold: 0.6 }
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [isMobile, opp.promo_video]);

  const handleMouseEnter = () => {
    if (!isMobile && videoRef.current) videoRef.current.play().catch(() => { });
  };

  const handleMouseLeave = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link
      href={`/student/opportunities/${opp.id}`}
      className="min-w-[280px] md:min-w-[320px] snap-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-32 bg-gray-200 relative">
        {opp.promo_video ? (
          <video
            ref={videoRef}
            src={opp.promo_video}
            className="w-full h-full object-cover bg-black"
            muted
            loop
            playsInline
          />
        ) : opp.banner_image ? (
          <img src={opp.banner_image} alt={opp.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
            {DASHBOARD_STRINGS.NO_IMAGE_PLACEHOLDER}
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-primary shadow-sm pointer-events-none">
          {opp.type}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition">{opp.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{opp.orgName}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {(opp.skills || []).slice(0, 2).map((skill: string) => (
            <span key={skill} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {skill}
            </span>
          ))}
          {(opp.skills || []).length > 2 && (
            <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-1 rounded-full">
              +{opp.skills.length - 2}
            </span>
          )}
        </div>

        <div className="text-xs text-gray-400">
          {DASHBOARD_STRINGS.DEADLINE_PREFIX}{new Date(opp.deadline).toLocaleDateString("ro-RO")}
        </div>
      </div>
    </Link>
  );
}
