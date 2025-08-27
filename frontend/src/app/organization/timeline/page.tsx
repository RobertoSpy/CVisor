"use client";

export default function TimelinePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Timeline proiecte & impact</h1>
      <ul className="space-y-4">
        <li>
          <div className="font-bold">Hackathon Educație — 2025</div>
          <div className="text-sm text-gray-700">100 voluntari, 20 proiecte, 500 elevi ajutați</div>
          <div className="text-xs text-success">Finalizat</div>
        </li>
        {/* ...alte proiecte */}
      </ul>
    </div>
  );
}