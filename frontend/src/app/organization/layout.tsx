"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrganizationLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [studentName, setStudentname] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await fetch("http://localhost:5000/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (e) {
      console.error("Logout error", e);
    }
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    router.push("/");
  }

  // Verificare sesiune la fiecare acces
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          throw new Error("Unauthorized");
        }
        const data = await res.json();
        setStudentname(data.full_name);
      } catch {
        router.push("/");
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-neutral relative">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-gradient-to-r from-blue-900/90 via-blue-700/90 to-blue-500/90 border-b border-white/10 shadow-lg transition-all duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">

          {/* Logo */}
          <div className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
            CVISOR
          </div>

          {/* Hamburger button (mobile only) */}
          <button
            className="md:hidden text-2xl text-white"
            aria-label="Deschide meniul"
            onClick={() => setMenuOpen((o) => !o)}
          >
            ≡
          </button>

          {/* Meniu navigație desktop + mobil */}
          <div
            className={`absolute md:static top-full left-0 w-full md:w-auto bg-blue-900/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none shadow-lg md:shadow-none transition-all duration-200 ${menuOpen ? "block" : "hidden"
              } md:flex items-center justify-end md:gap-6 p-4 md:p-0 border-b md:border-none border-white/10`}
          >
            <nav className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm font-medium text-blue-100">
              {[
                { href: "/organization", label: "Dashboard" },
                { href: "/organization/explore", label: "Explorează" },
                { href: "/organization/students", label: "Studenți" },
                { href: "/organization/timeline", label: "Timeline" },
                { href: "/organization/testimonials", label: "Testimoniale" },
                { href: "/organization/skills", label: "Skill Radar" },
                { href: "/organization/opportunities", label: "Oportunități" },
                { href: "/organization/profile", label: "Profil" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
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
              className="mt-4 md:mt-0 px-5 py-2 rounded-full bg-white text-blue-900 hover:bg-blue-50 transition text-xs font-bold uppercase tracking-wider shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Greeting - Same color as navbar */}
      <div className="w-full bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 shadow-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">
            {studentName ? `Salut, ${studentName}!` : "Salut!"}
          </h1>
          <p className="text-blue-100 mt-1 opacity-90">
            Bine ai venit în panoul de control al organizației.
          </p>
        </div>
      </div>

      {/* Conținut */}
      <main className="max-w-6xl mx-auto px-4 pb-10 pt-8">
        {children}
      </main>
    </div>
  );
}