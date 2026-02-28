"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ApiClient from "../../lib/api/client";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Dashboard", subtitle: "Statisticile platformei CVISOR." },
  "/admin/users": { title: "Utilizatori", subtitle: "Gestionează studenții și organizațiile." },
};

function getPageInfo(pathname: string, name: string) {
  const exact = PAGE_TITLES[pathname];
  if (exact) {
    return {
      title: exact.title,
      subtitle: exact.subtitle,
    };
  }
  return { title: name ? `Salut, ${name}!` : "Salut!", subtitle: "" };
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminName, setAdminName] = useState("");
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

  useEffect(() => {
    (async () => {
      try {
        const data = await ApiClient.get<{ full_name: string; role: string }>("/api/auth/me");
        if (data.role !== "admin") {
          throw new Error("Nu ești admin.");
        }
        setAdminName(data.full_name);
      } catch {
        localStorage.removeItem("role");
        localStorage.removeItem("full_name");
        router.push("/");
      }
    })();
  }, [router]);

  const pageInfo = getPageInfo(pathname, adminName);

  return (
    <div className="min-h-screen bg-neutral relative">
      <div>
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-gradient-to-r from-red-900/90 via-red-800/90 to-red-600/90 border-b border-white/10 shadow-lg transition-all duration-300">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
            <div className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
              CVISOR <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full uppercase ml-1">Admin</span>
            </div>

            <button
              className="md:hidden text-2xl text-white"
              onClick={() => setMenuOpen((o) => !o)}
            >
              ≡
            </button>

            <div
              className={`absolute md:static top-full left-0 w-full md:w-auto bg-red-900/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none shadow-lg md:shadow-none transition-all duration-200 ${menuOpen ? "block" : "hidden"} md:flex items-center justify-end md:gap-6 p-4 md:p-0 border-b md:border-none border-white/10`}
            >
              <nav className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm font-medium text-red-100">
                {[
                  { href: "/admin", label: "Dashboard" },
                  { href: "/admin/users", label: "Utilizatori" },
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
                className="mt-4 md:mt-0 px-5 py-2 rounded-full bg-white text-red-900 hover:bg-red-50 transition text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="w-full bg-gradient-to-r from-red-900 via-red-800 to-red-600 shadow-md">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">
              {pageInfo.title}
            </h1>
            {pageInfo.subtitle && (
              <p className="text-red-100 mt-1 opacity-90">
                {pageInfo.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-10 pt-8">
        {children}
      </main>
    </div>
  );
}
