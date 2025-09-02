"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrganizationLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  // Verificare token la fiecare acces
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral">
      <header className="bg-primary text-white">
        {/* Bara superioară */}
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3 border-b border-white/15">
          <div className="font-bold text-xl">CVISOR — Organizație</div>
          <nav className="flex gap-2 text-sm">
            {[
              { href: "/organization", label: "Dashboard" },
              { href: "/organization/timeline", label: "Timeline & Impact" },
              { href: "/organization/testimonials", label: "Testimoniale" },
              { href: "/organization/skills", label: "Skill Radar" },
              { href: "/organization/opportunities", label: "Oportunități" },
              { href: "/organization/profile", label: "Profil" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg hover:bg-white/15 transition"
              >
                {label}
              </Link>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-700 transition font-semibold ml-2"
          >
            Logout
          </button>
        </div>

        {/* Hero cu gradient + subtitlu */}
        <div className="bg-gradient-hero border-b border-black/10">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
              Zona organizației
            </h1>
            <p className="text-white/90 mt-1">
              Dashboard, proiecte și oportunități pentru organizația ta.
            </p>
          </div>
        </div>
      </header>

      {/* Conținut */}
      <main className="max-w-6xl mx-auto px-4 pb-10">
        {children}
      </main>
    </div>
  );
}