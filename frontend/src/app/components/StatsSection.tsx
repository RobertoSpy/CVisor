// Server Component — no "use client" for SEO
import { FiStar, FiHelpCircle, FiSmile, FiUsers, FiBriefcase } from "react-icons/fi";

const infoCards = [
  {
    icon: <FiStar className="text-4xl text-secondary" />,
    question: "Ce este CVISOR?",
    answer: (
      <>
        <span className="font-bold text-primary">CVISOR</span> e ca un festival digital unde energia studenților și pasiunea pentru cunoaștere se întâlnesc!
        Dacă toate asociațiile din oraș s-ar aduna pe o singură scenă, iar tu ai fi liber să alegi: dansezi la petreceri sau descoperi ceva nou la un workshop?
      </>
    ),
  },
  {
    icon: <FiHelpCircle className="text-4xl text-blue-500" />,
    question: "Ce tipuri de oportunități găsesc?",
    answer: (
      <>
        <span className="font-bold text-blue-600">Party</span> – petreceri legendare, evenimente, distracție non-stop.<br />
        <span className="font-bold text-blue-600">Self-development</span> – workshopuri, conferințe, hackathoane, inspirație la pachet pentru fiecare student.
      </>
    ),
  },
  {
    icon: <FiSmile className="text-4xl text-pink-500" />,
    question: "Cum aleg unde merg?",
    answer: (
      <>
        Nu vă mai limitați doar la petrecerile din cadrul facultății voastre! Acum aveți în față <span className="font-bold text-blue-600">TOATE</span> petrecerile care se întâmplă în Iași, ca să alegeți unde vreți să mergeți.
      </>
    ),
  },
  {
    icon: <FiUsers className="text-4xl text-green-500" />,
    question: "Ce e special la self-development?",
    answer: (
      <>
        Afli instant ce oportunități există pe <span className="font-bold text-blue-600">nișa ta</span>, dar și ce se întâmplă pe celelalte nișe — <span className="font-bold text-blue-600 text-accent">TOTUL GRATUIT!</span>
      </>
    ),
  },
  {
    icon: <FiBriefcase className="text-4xl text-yellow-500" />,
    question: "De ce să folosesc CVISOR?",
    answer: (
      <>
        <span className="font-bold text-blue-600">CVISOR</span> e locul unde studenții și asociațiile se întâlnesc, râd, învață și creează amintiri.<br />
        <span className="text-blue-600 font-semibold">Ce mai aștepți? Fă-ți cont și descoperă!</span>
      </>
    ),
  },
];

export default function StatsSection() {
  return (
    <section id="stats" className="w-full py-20 bg-white flex flex-col items-center justify-center gap-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl px-4">
        {infoCards.map((card, idx) => {
          const isLastOdd = idx === infoCards.length - 1 && infoCards.length % 2 !== 0;
          return (
            <div
              key={idx}
              className={`group relative p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden
                ${isLastOdd ? "md:col-span-2 md:justify-self-center md:max-w-2xl" : ""}
              `}
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-secondary group-hover:w-full group-hover:opacity-10 transition-all duration-500"></div>
              <div className="flex items-start gap-6 relative z-10">
                <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-primary text-xl mb-3 group-hover:text-blue-700 transition-colors">{card.question}</h3>
                  <div className="text-gray-600 text-base leading-relaxed">{card.answer}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}