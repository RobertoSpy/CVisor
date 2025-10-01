"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrganizationLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [studentName, setStudentname] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  // Verificare token la fiecare acces
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/");
    }
    const name = localStorage.getItem("full_name");
    if (name) setStudentname(name);
  }, []);

  return (
    <div className="min-h-screen bg-neutral">
      <header className="w-full bg-gradient-to-r from-blue-500 via-primary to-pink-400 text-white">
        {/* Bara superioară */}
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/15 relative">
          <div className="font-bold text-xl">CVISOR — Organizație</div>
          {/* Hamburger button (mobile only) */}
          <button
            className="md:hidden text-3xl ml-auto"
            aria-label="Deschide meniul"
            onClick={() => setMenuOpen((o) => !o)}
          >
            ≡
          </button>
          {/* Meniu navigație desktop + mobil */}
          <div
            className={`absolute md:static top-14 left-0 w-full md:w-auto bg-gradient-to-r from-blue-500 via-primary to-pink-400 md:bg-transparent z-20 transition-all duration-200 ${
              menuOpen ? "block" : "hidden"
            } md:flex items-center justify-end md:gap-4`}
          >
            <nav className="flex flex-col md:flex-row gap-2 md:gap-2 text-sm px-4 md:px-0 py-2 md:py-0">
              {[
                { href: "/organization", label: "Dashboard" },
                { href: "/organization/students", label: "Studenți" },
                { href: "/organization/timeline", label: "Timeline & Impact" },
                { href: "/organization/testimonials", label: "Testimoniale" },
                { href: "/organization/skills", label: "Skill Radar" },
                { href: "/organization/opportunities", label: "Oportunități" },
                { href: "/organization/profile", label: "Profil" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-1.5 rounded-lg hover:bg-white/15 transition text-left"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-700 transition font-semibold ml-2 mt-2 md:mt-0"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Hero cu gradient + subtitlu */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
            {studentName
              ? `Bine ati venit, ${studentName}!`
              : "Zona organizației"
            }
          </h1>
          <p className="text-white/90 mt-1">
            Dashboard, proiecte și oportunități pentru organizația ta.
          </p>
        </div>
      </header>

      {/* Conținut */}
      <main className="max-w-6xl mx-auto px-4 pb-10">
        {children}
      </main>
    </div>
  );
}