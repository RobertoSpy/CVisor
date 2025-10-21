"use client";
import { FiStar, FiUserCheck, FiHelpCircle, FiSmile, FiUsers, FiBriefcase, FiHelpCircle as FiQuestion } from "react-icons/fi";


const infoCards = [
  {
    icon: <FiStar className="text-3xl text-primary" />,
    question: "Ce este CVISOR?",
    answer: (
      <>
        <span className="font-bold text-primary">CVISOR</span> e ca un festival digital unde energia studenților și pasiunea pentru cunoaștere se întâlnesc!  
        Dacă toate asociațiile din oraș s-ar aduna pe o singură scenă, iar tu ai fi liber să alegi: dansezi la petreceri sau descoperi ceva nou la un workshop?
      </>
    ),
  },
  {
    icon: <FiHelpCircle className="text-3xl text-blue-700" />,
    question: "Ce tipuri de oportunități găsesc?",
    answer: (
      <>
        <span className="font-bold text-blue-600">Party</span> – petreceri legendare, evenimente, distracție non-stop.<br />
        <span className="font-bold text-blue-600">Self-development</span> – workshopuri, conferințe, hackathoane, inspirație la pachet pentru fiecare student.
      </>
    ),
  },
  {
    icon: <FiSmile className="text-3xl text-pink-600" />,
    question: "Cum aleg unde merg?",
    answer: (
      <>
        Nu vă mai limitați doar la petrecerile din cadrul facultății voastre! Acum aveți in fata<span className="font-bold text-blue-600">TOATE</span> petrecerile care se întâmplă în Iași, ca să alegeți unde vreți să mergeți.
      </>
    ),
  },
  {
    icon: <FiUsers className="text-3xl text-green-600" />,
    question: "Ce e special la self-development?",
    answer: (
      <>
        Afli instant ce oportunități există pe <span className="font-bold text-blue-600">nisa ta</span>, dar și ce se întâmplă pe celelalte nise — <span className="font-bold text-blue-600 text-accent">TOTUL GRATUIT!</span>
      </>
    ),
  },
  {
    icon: <FiBriefcase className="text-3xl text-yellow-600" />,
    question: "De ce să folosesc CVISOR?",
    answer: (
      <>
        <span className="font-bold text-blue-600">CVISOR</span> e locul unde studenții și asociațiile se întâlnesc, râd, învață și creează amintiri.<br />
        <span className="text-blue-600 font-semibold">Ce mai astepti? Fa-ti cont si descopera!</span>
      </>
    ),
  },
];

export default function StatsSection() {
  return (
    <section id="stats" className="w-full flex flex-col items-center justify-center gap-10">
      {/* Info Cards - 2 coloane pe tabletă/deskop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-6xl">
        {infoCards.map((card, idx) => {
          // Centrare ultimul card dacă e singur pe rând
          const isLastOdd = idx === infoCards.length - 1 && infoCards.length % 2 !== 0;
          return (
            <div
              key={idx}
              className={`flex items-start gap-5 p-6 rounded-2xl shadow-lg hover:scale-105 transition bg-white cursor-pointer border-b-4 border-primary/30
                ${isLastOdd ? "sm:col-span-2 sm:justify-self-center sm:max-w-xl" : ""}
              `}
            >
              <div>{card.icon}</div>
              <div>
                <div className="font-bold text-primary text-lg mb-2">{card.question}</div>
                <div className="text-gray-700 text-md">{card.answer}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}