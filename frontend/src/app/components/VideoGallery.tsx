export default function VideoGallery() {
  const videos = [
    { id: "abc123", title: "Testimonial Student 1" },
    { id: "def456", title: "Testimonial Student 2" },
    { id: "ghi789", title: "Partener Asociație" },
  ];
  return (
    <section className="py-12 bg-gradient-video" id="testimoniale">
      <h2 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-lg">Testimoniale Video</h2>
      <div className="flex flex-wrap gap-8 justify-center">
        {videos.map((video) => (
          <div key={video.id} className="w-96">
            <iframe
              width="384"
              height="216"
              src={`https://www.youtube.com/embed/${video.id}`}
              title={video.title}
              className="rounded-xl shadow-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="mt-2 text-center text-white font-medium drop-shadow">{video.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}