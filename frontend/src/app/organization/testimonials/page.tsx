"use client";

export default function TestimonialsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Testimoniale</h1>
      <div className="flex gap-4 overflow-x-auto">
        {/* Exemplu testimonial */}
        <div className="min-w-[250px] p-4 bg-white rounded-xl shadow">
          <div className="font-medium">“A fost cea mai tare experiență!”</div>
          <div className="text-xs text-gray-500 mt-1">Maria, voluntar</div>
        </div>
        {/* ...alte testimoniale */}
      </div>
    </div>
  );
}