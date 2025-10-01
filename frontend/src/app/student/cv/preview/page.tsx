"use client";
import { useEffect, useMemo, useState } from "react";

type SocialLinks = { github?: string; linkedin?: string; website?: string };
type EducationItem = { id: string; school: string; degree: string; start: string; end?: string; details?: string };
type ExperienceItem = { id: string; role: string; company: string; start: string; end?: string; details?: string };
type ProfilePayload = {
  name: string;
  headline?: string;
  bio?: string;
  avatarDataUrl?: string; // în prod: URL
  skills: string[];
  social: SocialLinks;
  education: EducationItem[];
  experience: ExperienceItem[];
};


function fmtRange(start?: string, end?: string) {
  if (!start && !end) return "";
  const s = start ? new Date(start + "-01").toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";
  const e = end ? new Date(end + "-01").toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "Prezent";
  return [s, e].filter(Boolean).join(" – ");
}

export default function CVPreviewPage() {
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          setData(json as ProfilePayload);
        } else {
          throw new Error("fallback");
        }
      } catch {
        // fallback localStorage
        const raw = typeof window !== "undefined" ? localStorage.getItem("cvisor_profile") : null;
        if (raw) setData(JSON.parse(raw));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasData = !!data;

  const socials = useMemo(() => {
    if (!data?.social) return [];
    return [
      data.social.github ? { label: "GitHub", url: data.social.github } : null,
      data.social.linkedin ? { label: "LinkedIn", url: data.social.linkedin } : null,
      data.social.website ? { label: "Website", url: data.social.website } : null,
    ].filter(Boolean) as { label: string; url: string }[];
  }, [data]);

  function printPDF() {
    window.print();
  }

  return (
    <div className="bg-neutral min-h-screen">
      {/* bară acțiuni (ascunsă la print) */}
      <div className="max-w-5xl mx-auto px-4 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Previzualizare CV</h1>
          <div className="flex gap-2">
            <a href="/student/profile" className="px-3 py-2 rounded-lg bg-white ring-1 ring-black/10 hover:bg-black/5 transition">Înapoi la profil</a>
            <button onClick={printPDF} className="px-3 py-2 rounded-lg bg-primary text-white hover:bg-accent transition shadow">
              Exportă PDF
            </button>
          </div>
        </div>
      </div>

      {/* container A4 */}
      <div className="max-w-5xl mx-auto px-4 pb-10">
        <div className="bg-card rounded-2xl p-8 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)] print:shadow-none print:ring-0 print:rounded-none print:p-10 print:bg-white">
          {loading && <div>Se încarcă datele…</div>}

          {!loading && !hasData && (
            <div className="text-center text-sm text-gray-600">
              Nu am găsit date de profil. Te rog salvează profilul sau asigură-te că ești conectat.
            </div>
          )}

          {hasData && (
            <>
              {/* Header CV */}
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-black/5 ring-1 ring-black/10 shrink-0">
                  {data?.avatarDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.avatarDataUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">Fără avatar</div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-extrabold tracking-tight">{data?.name || "Nume Prenume"}</h2>
                  {data?.headline && <p className="text-base text-gray-700 mt-1">{data.headline}</p>}
                  {data?.bio && <p className="text-sm text-gray-600 mt-2">{data.bio}</p>}

                  {socials.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3 text-sm">
                      {socials.map((s) => (
                        <a key={s.label} href={s.url} className="underline underline-offset-4 decoration-primary hover:text-primary break-all">
                          {s.label}: {s.url}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              {data?.skills?.length ? (
                <section className="mt-6">
                  <h3 className="text-lg font-semibold tracking-tight">Competențe</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {data.skills.map((s) => (
                      <span key={s} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                        {s}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* Experience */}
              {data?.experience?.length ? (
                <section className="mt-6">
                  <h3 className="text-lg font-semibold tracking-tight">Experiență</h3>
                  <div className="mt-2 space-y-4">
                    {data.experience.map((e) => (
                      <div key={e.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div className="font-medium">{e.role || "Rol"}</div>
                          <div className="text-xs text-gray-600">{fmtRange(e.start, e.end)}</div>
                        </div>
                        <div className="text-sm text-gray-700">{e.company}</div>
                        {e.details && <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{e.details}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* Education */}
              {data?.education?.length ? (
                <section className="mt-6">
                  <h3 className="text-lg font-semibold tracking-tight">Educație</h3>
                  <div className="mt-2 space-y-4">
                    {data.education.map((ed) => (
                      <div key={ed.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div className="font-medium">{ed.school || "Instituție"}</div>
                          <div className="text-xs text-gray-600">{fmtRange(ed.start, ed.end)}</div>
                        </div>
                        <div className="text-sm text-gray-700">{ed.degree}</div>
                        {ed.details && <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{ed.details}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Stiluri print */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 16mm; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
