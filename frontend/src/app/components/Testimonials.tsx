export default function Testimonials() {
  const testimonials = [
    {
      name: "Andrei",
      text: "CVISOR m-a ajutat să găsesc asociația potrivită și să mă implic activ!",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Ioana",
      text: "Soluția perfectă pentru studenți! Recomand tuturor celor care vor să se implice.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
  ];
  return (
    <section className="py-12 bg-gradient-hero">
      <h2 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-lg">Ce spun utilizatorii</h2>
      <div className="flex gap-8 justify-center flex-wrap">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-white bg-opacity-80 rounded-lg shadow-xl p-6 flex flex-col items-center max-w-xs transition-transform hover:scale-105 hover:shadow-2xl"
          >
            <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mb-4 shadow-md" />
            <p className="text-dark italic mb-4">“{t.text}”</p>
            <span className="text-primary font-bold">{t.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}