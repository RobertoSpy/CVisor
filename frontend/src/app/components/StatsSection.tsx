import CardStudent from "./CardStudent";

const stats = [
  { title: "2000+ Studenți", desc: "Ajutați să învețe eficient", icon: "🎓" },
  { title: "150+ Profesori", desc: "Implicare activă", icon: "👨‍🏫" },
  { title: "30+ Asociații", desc: "Colaborare", icon: "🏢" },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-secondary flex justify-center gap-8 flex-wrap">
      {stats.map((stat, idx) => (
        <CardStudent key={idx} {...stat} />
      ))}
    </section>
  );
}