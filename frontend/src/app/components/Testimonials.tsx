// Server Component — no "use client" for SEO
import { FiUsers, FiBriefcase, FiHelpCircle } from "react-icons/fi";

const partners = [
  {
    icon: <FiUsers className="text-5xl text-white" />,
    title: "2000+ Studenți",
    desc: "Suntem dedicați să ajutăm studenții să se dezvolte și să găsească oportunități.",
    color: "bg-blue-500",
  },
  {
    icon: <FiBriefcase className="text-5xl text-white" />,
    title: "15+ Asociații",
    desc: "Colaborăm cu asociații studențești pentru o comunitate mai puternică.",
    color: "bg-pink-500",
  },
  {
    icon: <FiHelpCircle className="text-5xl text-white" />,
    title: "În curând",
    desc: "Pregătim noi parteneriate și surprize pentru comunitate!",
    color: "bg-purple-500",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50" id="parteneri">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-center text-primary mb-12 drop-shadow-sm">
          Parteneriate <span className="text-secondary">CVISOR</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {partners.map((card, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col items-center gap-6 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white hover:-translate-y-2 border border-gray-100"
            >
              <div className={`p-6 rounded-full shadow-lg ${card.color} transform group-hover:rotate-12 transition-transform duration-300`}>
                {card.icon}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-2xl text-gray-800 mb-3">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}