"use client";
import { FiMail, FiInstagram, FiPhone } from "react-icons/fi";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const contactData = [
  { icon: <FiMail className="text-3xl text-primary" />, title: "Email", value: "echipa@cvisor.ro", link: "mailto:echipa@cvisor.ro" },
  { icon: <FiInstagram className="text-3xl text-pink-600" />, title: "Instagram", value: "@cvisor", link: "https://instagram.com/cvisor" },
  { icon: <FiPhone className="text-3xl text-green-600" />, title: "Telefon", value: "+40 712 345 678", link: "tel:+40712345678" },
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header with Diagonal Line */}
      <div className="relative w-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 pt-32 pb-48 text-center text-white overflow-hidden">
        <div className="relative z-10 px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg mb-4">
            Contactează-ne
          </h1>
          <p className="text-xl text-blue-100 font-medium max-w-2xl mx-auto">
            Suntem aici pentru orice întrebare, colaborare sau sugestie!
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-white transform -skew-y-3 origin-bottom-right translate-y-10 z-20 border-t-4 border-secondary"></div>
      </div>

      <main className="flex-1 container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">

          {/* Contact Info */}
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Date de contact</h2>
            {contactData.map((contact) => (
              <a
                key={contact.title}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 group"
              >
                <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                  {contact.icon}
                </div>
                <div>
                  <div className="font-bold text-gray-400 text-sm uppercase tracking-wider">{contact.title}</div>
                  <div className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">{contact.value}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Form */}
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-bl-full -mr-8 -mt-8"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8 relative z-10">Trimite un mesaj</h2>
            <form className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Nume" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                <input type="email" placeholder="Email" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <input type="tel" placeholder="Telefon" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              <textarea rows={4} placeholder="Mesajul tău..." className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"></textarea>
              <button className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:-translate-y-1">
                Trimite Mesajul
              </button>
            </form>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}