"use client";
import { FiUsers, FiBriefcase, FiHelpCircle } from "react-icons/fi";

const partners = [
  {
    icon: <FiUsers className="text-4xl text-primary" />,
    title: "2000+ Studenți",
    desc: "Suntem dedicați să ajutăm studenții să se dezvolte și să găsească oportunități.",
  },
  {
    icon: <FiBriefcase className="text-4xl text-pink-600" />,
    title: "15+ Asociații",
    desc: "Colaborăm cu asociații studențești pentru o comunitate mai puternică.",
  },
  {
    icon: <FiHelpCircle className="text-4xl text-gray-400" />,
    title: "În curând",
    desc: "Pregătim noi parteneriate și surprize pentru comunitate!",
  },
];

export default function Testimonials() {
  return (
    <section className="py-12" id="parteneri">
      <h2 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-lg">Parteneriate CVISOR</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {partners.map((card, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl shadow-lg hover:scale-105 transition bg-white cursor-pointer border-b-4 border-primary/30"
          >
            <div>{card.icon}</div>
            <div className="font-bold text-primary text-lg">{card.title}</div>
            <div className="text-gray-700 text-md text-center">{card.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}