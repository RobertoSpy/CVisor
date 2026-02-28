"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ApiClient from "../../lib/api/client";

// Page title configuration
const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/organization": { title: "", subtitle: "Bine ai venit în panoul de control al organizației." },
  "/organization/explore": { title: "Explorează", subtitle: "Descoperă studenți și oportunități." },
  "/organization/students": { title: "Studenți", subtitle: "Gestionează studenții platformei." },
  "/organization/opportunities": { title: "Oportunități", subtitle: "Administrează oportunitățile tale." },
  "/organization/profile": { title: "Profilul Organizației", subtitle: "Editează informațiile organizației." },
};

function getPageInfo(pathname: string, name: string) {
  const exact = PAGE_TITLES[pathname];
  if (exact) {
    return {
      title: exact.title || (name ? `Salut, ${name}!` : "Salut!"),
      subtitle: exact.subtitle,
    };
  }
  const parentPath = pathname.split("/").slice(0, 3).join("/");
  const parent = PAGE_TITLES[parentPath];
  if (parent) {
    return {
      title: parent.title,
      subtitle: parent.subtitle,
    };
  }
  return { title: name ? `Salut, ${name}!` : "Salut!", subtitle: "" };
}

export default function OrganizationLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [orgName, setOrgName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await ApiClient.post("/api/auth/logout", {});
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
        const data = await ApiClient.get<{ full_name: string }>("/api/auth/me");
        setOrgName(data.full_name);
      } catch {
        localStorage.removeItem("role");
        localStorage.removeItem("full_name");
        router.push("/");
      }
    })();
  }, [router]);

  const pageInfo = getPageInfo(pathname, orgName);

  return (
    <div className="min-h-screen bg-neutral relative">
      <div>
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
                  { href: "/organization/opportunities", label: "Oportunități" },
                  { href: "/organization/profile", label: "Profil" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all ${pathname === href ? "bg-white/15 text-white" : ""}`}
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

        {/* Hero Section with contextual title */}
        <div className="w-full bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 shadow-md">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">
              {pageInfo.title}
            </h1>
            {pageInfo.subtitle && (
              <p className="text-blue-100 mt-1 opacity-90">
                {pageInfo.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Conținut */}
      <main className="max-w-6xl mx-auto px-4 pb-10 pt-8">
        {children}
      </main>
    </div>
  );
}