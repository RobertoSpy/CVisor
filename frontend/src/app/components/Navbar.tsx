"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const navLinks = [
    { name: "Despre", href: "/about" },
    { name: "Studii", href: "/studies" },
    { name: "Contact", href: "/contact" },
  ];

  // Navbar: always solid dark blue on scroll, gradient blue when at top
  const navBg = scrolled
    ? "bg-blue-900 shadow-lg py-3"
    : "bg-gradient-to-r from-blue-900/80 via-blue-800/80 to-blue-700/80 backdrop-blur-md py-5";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-wide hover:scale-105 transition-transform text-white">
          CVISOR
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="font-medium text-lg relative group transition-colors text-white/90 hover:text-white"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <Link href="/login" className="font-semibold transition-colors text-white hover:text-secondary">Autentificare</Link>
            <Link href="/register" className="bg-secondary text-white px-5 py-2 rounded-full font-bold shadow-md hover:bg-white hover:text-primary transition-all transform hover:-translate-y-0.5">Înregistrare</Link>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-3xl focus:outline-none z-[60] relative text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu Overlay — always dark for visibility */}
      {open && (
        <div
          className="md:hidden fixed top-0 left-0 w-full h-[100dvh] z-[55] flex flex-col items-center justify-center gap-10"
          style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #3b82f6 100%)" }}
        >
          {/* Logo */}
          <div className="text-white text-3xl font-extrabold tracking-wide mb-2">CVISOR</div>

          {/* Nav Links */}
          <ul className="flex flex-col items-center gap-5 text-xl font-semibold text-white/90">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="hover:text-secondary transition-colors px-6 py-2 rounded-xl hover:bg-white/10"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth Buttons */}
          <div className="flex flex-col gap-4 w-64">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="w-full text-center border-2 border-white text-white py-3.5 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-900 transition-all"
            >
              Autentificare
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="w-full text-center bg-secondary text-white py-3.5 rounded-2xl font-bold text-lg shadow-lg hover:bg-white hover:text-primary transition-all"
            >
              Înregistrare
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
