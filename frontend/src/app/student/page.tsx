function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-0.5 tracking-tight">{value}</div>
    </div>
  );
}

export default function StudentHome() {
  return (
    <div className="space-y-8 mt-10">
      {/* statistici */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Stat title="Puncte" value={120} />
        <Stat title="Badge-uri" value={3} />
        <Stat title="Aplicații" value={2} />
        <Stat title="Recomandate" value={5} />
      </div>

      {/* recomandate */}
      <section className="bg-card rounded-2xl p-6 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-semibold tracking-tight mb-2">Oportunități recomandate</h2>
        <p className="text-sm text-gray-600 mb-4">
          Vezi lista completă și aplică rapid.
        </p>
        <a
          href="/student/opportunities"
          className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-accent transition shadow"
        >
          Vezi oportunități <span>→</span>
        </a>
      </section>
    </div>
  );
}
