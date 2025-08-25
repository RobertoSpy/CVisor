"use client";
import { useEffect, useMemo, useState } from "react";

type Opportunity = {
  id: string;
  title: string;
  orgName: string;
  type: string;
  skills: string[];
  deadline?: string;
};

export default function OpportunitiesPage() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      // TODO: leagă de backend (ex):
      // const url = `${process.env.NEXT_PUBLIC_API_BASE}/api/opportunities${q ? `?q=${encodeURIComponent(q)}` : ""}`;
      // const res = await fetch(url, { credentials: "include" });
      // setItems(await res.json());

      // demo fallback
      const demo: Opportunity[] = [
        { id: "1", title: "Voluntariat Tech Event", orgName: "DevClub", type: "volunteering", skills: ["JS", "Teamwork"], deadline: "2025-10-01" },
        { id: "2", title: "Workshop React", orgName: "CVisor Org", type: "workshop", skills: ["React"], deadline: "2025-10-05" },
      ];
      setItems(q ? demo.filter(d => (d.title + d.skills.join(" ")).toLowerCase().includes(q.toLowerCase())) : demo);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // on mount

  // handle Enter pentru input
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") load();
  }

  return (
    <div className="space-y-8 mt-10">
      {/* BARĂ DE CĂUTARE */}
      <div className="bg-card rounded-2xl p-4 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Caută după titlu sau skill (ex: React)"
            className="flex-1 bg-white/80 border border-black/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-secondary text-white hover:bg-accent transition shadow"
          >
            Caută
          </button>
        </div>
      </div>

      {/* LISTĂ OPORTUNITĂȚI */}
      {loading ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <li
              key={i}
              className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] animate-pulse"
            >
              <div className="h-3 w-24 bg-black/10 rounded mb-2" />
              <div className="h-5 w-3/4 bg-black/10 rounded mb-3" />
              <div className="h-3 w-20 bg-black/10 rounded mb-3" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-black/10 rounded" />
                <div className="h-6 w-20 bg-black/10 rounded" />
              </div>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
          <h3 className="text-lg font-semibold tracking-tight">Nicio oportunitate găsită</h3>
          <p className="text-sm text-gray-600 mt-1">Încearcă alt termen sau golește filtrul.</p>
          <button
            onClick={() => { setQ(""); load(); }}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-white hover:bg-accent transition shadow"
          >
            Resetează căutarea
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((op) => (
            <li
              key={op.id}
              className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
            >
              <div className="text-xs text-gray-500">{op.orgName}</div>
              <h3 className="text-lg font-semibold tracking-tight mt-0.5">{op.title}</h3>
              <div className="text-xs mt-1">Tip: {op.type}</div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {op.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {op.deadline && (
                <div className="text-xs mt-3 text-gray-600">
                  Deadline: {new Date(op.deadline).toLocaleDateString()}
                </div>
              )}

              <div className="mt-4">
                <a
                  href={`/student/opportunities/${op.id}`}
                  className="inline-flex items-center gap-2 underline underline-offset-4 decoration-primary hover:text-primary"
                >
                  Detalii & aplică <span>→</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
