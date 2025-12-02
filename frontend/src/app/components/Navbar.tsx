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

  const navLinks = [
    { name: "Despre", href: "/about" },
    { name: "Studii", href: "/studies" },
    { name: "Testimoniale", href: "/testimonials" },
    { name: "Contact", href: "/contact" },
  ];

  // Dynamic classes based on scroll state
  const navBg = scrolled ? "bg-white/90 backdrop-blur-md shadow-lg py-3" : "bg-transparent py-5";
  const textColor = scrolled ? "text-primary" : "text-white";
  const mobileBg = scrolled ? "bg-white/98" : "bg-primary/98";
  const mobileText = scrolled ? "text-primary" : "text-white";
  const loginBorder = scrolled ? "border-primary text-primary hover:bg-primary hover:text-white" : "border-white text-white hover:bg-white hover:text-primary";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className={`text-2xl font-extrabold tracking-wide hover:scale-105 transition-transform ${textColor}`}>
          CVISOR
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`font-medium text-lg relative group transition-colors ${scrolled ? "text-gray-700 hover:text-primary" : "text-white/90 hover:text-white"}`}
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <Link href="/login" className={`font-semibold transition-colors ${scrolled ? "text-primary hover:text-secondary" : "text-white hover:text-secondary"}`}>Login</Link>
            <Link href="/register" className="bg-secondary text-white px-5 py-2 rounded-full font-bold shadow-md hover:bg-white hover:text-primary transition-all transform hover:-translate-y-0.5">Înregistrare</Link>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`md:hidden text-3xl focus:outline-none z-50 relative ${open ? (scrolled ? "text-primary" : "text-white") : textColor}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 ${mobileBg} backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <ul className={`flex flex-col items-center gap-6 text-2xl font-bold ${mobileText}`}>
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href} onClick={() => setOpen(false)}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-4 w-64">
          <Link href="/login" onClick={() => setOpen(false)} className={`w-full text-center border-2 py-3 rounded-xl font-bold transition ${loginBorder}`}>Login</Link>
          <Link href="/register" onClick={() => setOpen(false)} className="w-full text-center bg-secondary text-white py-3 rounded-xl font-bold shadow-lg hover:bg-white hover:text-primary transition">Înregistrare</Link>
        </div>
      </div>
    </nav>
  );
}
