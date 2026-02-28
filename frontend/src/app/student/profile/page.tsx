"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

// ===================== Types =====================
type SocialLinks = { github?: string; linkedin?: string; website?: string; instagram?: string };
type EducationItem = { id: string; school: string; degree: string; start: string; end?: string; details?: string };
type ExperienceItem = { id: string; role: string; company: string; start: string; end?: string; details?: string };
type Media = { id: string; kind: "image" | "video"; url: string; caption?: string };
type OppRef = { id: string; title: string; role?: string; org?: string; date?: string; tags?: string[]; cover?: string; media?: Media[]; rating?: number; testimonial?: string; certificateUrl?: string };

type ProfilePayload = {
  name: string;
  headline?: string;
  bio?: string;
  avatarDataUrl?: string;
  location?: string;
  skills: string[];
  social: SocialLinks;
  education: EducationItem[];
  experience: ExperienceItem[];
  portfolioMedia: Media[];
  opportunityRefs: OppRef[];
};

// ===================== Utils =====================
const uid = () => Math.random().toString(36).slice(2, 9);
const cls = (...x: Array<string | false | undefined | null>) => x.filter(Boolean).join(" ");

// Progress helpers
function pctProfile(p: ProfilePayload) {
  const checks = [!!p.name, !!p.headline, !!p.bio, p.skills.length > 0, p.education.length > 0, p.experience.length > 0, p.opportunityRefs.length > 0, p.portfolioMedia.length > 0];
  return Math.round(checks.reduce((a, b) => a + (b ? 1 : 0), 0) / checks.length * 100);
}

// Debounce helper
function useDebouncedCallback<T extends any[]>(fn: (...args: T) => void, delay = 600) {
  const t = useRef<NodeJS.Timeout | null>(null);
  return (...args: T) => { if (t.current) clearTimeout(t.current); t.current = setTimeout(() => fn(...args), delay); };
}

// ===================== UI Atoms (Premium) =====================
function Button({ children, className, onClick, disabled, type = "button", variant = "primary" }: { children: React.ReactNode; className?: string; onClick?: () => void; disabled?: boolean; type?: "button" | "submit"; variant?: "primary" | "secondary" | "ghost" }) {
  const base = "px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-sm flex items-center justify-center gap-2";
  const vars = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    ghost: "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls(base, vars[variant], disabled && "opacity-50 cursor-not-allowed pointer-events-none", className)}>
      {children}
    </button>
  );
}

function Field({ label, children, required, hint, error }: { label: string; children: React.ReactNode; required?: boolean; hint?: string; error?: string }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5 pl-1">
        <label className="text-sm font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors flex items-center gap-1.5">
          {label}
          {required && <span className="h-1.5 w-1.5 rounded-full bg-red-400" title="Obligatoriu" />}
        </label>
        {hint && <span className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-500 mt-1.5 pl-1 font-medium animate-in slide-in-from-top-1">{error}</p>}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cls("w-full rounded-2xl bg-gray-50 border-transparent px-5 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-800 placeholder:text-gray-400 hover:bg-gray-100/80 shadow-inner shadow-gray-200/50", props.className)} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cls("w-full rounded-2xl bg-gray-50 border-transparent px-5 py-4 min-h-[140px] outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-800 placeholder:text-gray-400 hover:bg-gray-100/80 shadow-inner shadow-gray-200/50 resize-y", props.className)} />;
}

function Card({ children, className, title, subtitle }: { children: React.ReactNode; className?: string; title?: string; subtitle?: string }) {
  return (
    <div className={cls("bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-xl shadow-gray-200/40 relative overflow-hidden", className)}>
      {(title || subtitle) && (
        <div className="mb-8 relative z-10">
          {title && <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-gray-500 mt-1 font-medium">{subtitle}</p>}
        </div>
      )}
      <div className="relative z-10">{children}</div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0" />
    </div>
  );
}

function Pill({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={cls("text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100", className)}>{children}</span>;
}

// ===================== Stepper =====================
const STEPS = [
  { key: "basics", label: "Despre Tine", icon: "👤" },
  { key: "skills", label: "Skill-uri", icon: "⚡" },
  { key: "edu", label: "Educație", icon: "🎓" },
  { key: "exp", label: "Experiență", icon: "💼" },
  { key: "opps", label: "Proiecte", icon: "🚀" },
  { key: "portfolio", label: "Portofoliu", icon: "🖼️" },
  { key: "review", label: "Verificare", icon: "✅" },
] as const;

type StepKey = typeof STEPS[number]["key"];

function Stepper({ current, completeMap, go }: { current: StepKey; completeMap: Record<StepKey, boolean>; go: (k: StepKey) => void }) {
  return (
    <nav className="sticky top-24 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 no-scrollbar">
      {STEPS.map((s, idx) => {
        const done = completeMap[s.key];
        const active = current === s.key;
        return (
          <button
            key={s.key}
            onClick={() => go(s.key)}
            className={cls(
              "group w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden",
              active ? "bg-white shadow-lg shadow-blue-500/10 scale-[1.02]" : "hover:bg-gray-50 text-gray-500 hover:text-gray-800"
            )}
          >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-r-full" />}
            <div className="flex items-center gap-4 relative z-10">
              <div className={cls(
                "h-10 w-10 rounded-xl grid place-items-center text-lg font-bold transition-all bg-gradient-to-br shadow-inner",
                active ? "from-blue-500 to-indigo-600 text-white shadow-blue-500/20" : done ? "from-emerald-500 to-teal-600 text-white" : "from-gray-100 to-gray-200 text-gray-400"
              )}>
                {done && !active ? "✓" : s.icon}
              </div>
              <div className="flex flex-col">
                <span className={cls("text-sm font-bold tracking-tight", active ? "text-gray-800" : "text-gray-500 group-hover:text-gray-700")}>{s.label}</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 transform scale-0 group-hover:scale-100 transition origin-left h-0 group-hover:h-auto">Pasul {idx + 1}</span>
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

// ===================== Feature: Avatar =====================
function AvatarUploader({ value, onChange }: { value?: string; onChange: (dataUrl?: string) => void }) {
  function handleFile(file: File) { const reader = new FileReader(); reader.onload = () => onChange(reader.result as string); reader.readAsDataURL(file); }
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="relative">
        <div className={cls("h-32 w-32 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 group-hover:rotate-3 group-hover:scale-105 border-4 border-white", !value && "bg-gray-100 flex items-center justify-center")}>
          {value ? <img src={value} alt="avatar" className="h-full w-full object-cover" /> : <span className="text-3xl text-gray-300">👤</span>}
        </div>
        <label className="absolute -bottom-3 -right-3 h-10 w-10 bg-blue-600 text-white rounded-full grid place-items-center cursor-pointer shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-transform hover:scale-110 active:scale-90">
          📷
          <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
      </div>
      {value && <button onClick={() => onChange(undefined)} className="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-1 rounded-full transition-colors">Șterge Avatar</button>}
    </div>
  );
}

// ===================== Timeline =====================
function Timeline({ education, experience, opps }: { education: EducationItem[]; experience: ExperienceItem[]; opps: OppRef[] }) {
  type Entry = { id: string; kind: "edu" | "exp" | "opp"; title: string; org: string; start: string; end?: string; tags?: string[]; rating?: number };
  const items: Entry[] = [
    ...education.map(e => ({ id: e.id, kind: "edu" as const, title: e.degree, org: e.school, start: e.start, end: e.end })),
    ...experience.map(x => ({ id: x.id, kind: "exp" as const, title: x.role, org: x.company, start: x.start, end: x.end })),
    ...opps.map(o => ({ id: o.id, kind: "opp" as const, title: o.title, org: o.org || "", start: o.date || "", tags: o.tags, rating: o.rating }))
  ].sort((a, b) => (a.start || "").localeCompare(b.start || ""));

  const color = (k: Entry["kind"]) => k === "edu" ? "from-blue-500/20 to-blue-500/5" : k === "exp" ? "from-emerald-500/20 to-emerald-500/5" : "from-amber-500/20 to-amber-500/5";
  const label = (k: Entry["kind"]) => k === "edu" ? "Educație" : k === "exp" ? "Experiență" : "Oportunitate";

  if (!items.length) return <div className="text-sm text-gray-500 italic p-4 text-center">Completează datele pentru a vedea timeline‑ul tău profesional.</div>;

  return (
    <ol className="relative pl-6 border-l border-gray-100 space-y-8">
      {items.map((it) => (
        <li key={it.id} className="relative pl-6">
          <div className="absolute -left-[30px] top-4 h-4 w-4 rounded-full border-2 border-white bg-blue-500 ring-4 ring-blue-50 shadow-sm" />
          <div className={cls("rounded-[1.5rem] p-6 border border-white/50 shadow-sm bg-gradient-to-br", color(it.kind))}>
            <div className="flex items-center gap-3 mb-2">
              <Pill className="bg-white/50 border-0 shadow-sm text-xs py-1">{label(it.kind)}</Pill>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{it.start}{it.end ? ` — ${it.end}` : ""}</span>
            </div>
            <h4 className="font-bold text-lg text-gray-900">{it.title}</h4>
            <div className="text-gray-600 font-medium">{it.org}</div>
            {it.tags && it.tags.length > 0 && (<div className="flex flex-wrap gap-1 mt-3">{it.tags.map(t => <span key={t} className="text-[10px] px-2 py-1 rounded bg-white/50 text-gray-600 font-semibold">#{t}</span>)}</div>)}
          </div>
        </li>
      ))}
    </ol>
  );
}

// ===================== Editors =====================
function SkillsEditor({ skills, setSkills }: { skills: string[]; setSkills: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const SUG = ["React", "TypeScript", "Java", "SQL", "HTML/CSS", "Node.js", "Git", "Docker", "Figma", "Communication", "Leadership"];

  function add() {
    const parts = input.split(",").map(x => x.trim()).filter(Boolean);
    if (!parts.length) return;
    setSkills(Array.from(new Set([...skills, ...parts])));
    setInput("");
  }

  function toggle(s: string) { setSkills(skills.includes(s) ? skills.filter(x => x !== s) : [...skills, s]); }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <TextInput placeholder="Ex: React, Public Speaking..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <Button onClick={add} variant="secondary">Adaugă</Button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          {skills.map(s => (
            <span key={s} className="group text-sm font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 shadow-sm flex items-center gap-2">
              {s}
              <button className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => setSkills(skills.filter(x => x !== s))}>✕</button>
            </span>
          ))}
        </div>
      )}

      <div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sugestii Populare</div>
        <div className="flex flex-wrap gap-2">
          {SUG.map(s => (
            <button key={s} onClick={() => toggle(s)} className={cls("text-xs font-semibold px-3 py-1.5 rounded-full transition-all border", skills.includes(s) ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50")}>
              {skills.includes(s) ? "✓ " : "+ "}{s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EduEditor({ items, setItems }: { items: EducationItem[]; setItems: (v: EducationItem[]) => void }) {
  function up(id: string, p: Partial<EducationItem>) { setItems(items.map(it => it.id === id ? { ...it, ...p } : it)); }
  function add() { setItems([...items, { id: uid(), school: "", degree: "", start: "", end: "" }]); }

  return (
    <div className="space-y-4">
      {items.map(it => (
        <div key={it.id} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 relative group transition-all hover:bg-white hover:shadow-lg">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Grad / Diplomă"><TextInput value={it.degree} onChange={e => up(it.id, { degree: e.target.value })} placeholder="Ex: Licență Informatică" /></Field>
            <Field label="Instituție"><TextInput value={it.school} onChange={e => up(it.id, { school: e.target.value })} placeholder="Ex: Universitatea..." /></Field>
            <Field label="Început"><TextInput type="month" value={it.start} onChange={e => up(it.id, { start: e.target.value })} /></Field>
            <Field label="Sfârșit (opțional)"><TextInput type="month" value={it.end || ""} onChange={e => up(it.id, { end: e.target.value })} /></Field>
          </div>
          <button onClick={() => setItems(items.filter(x => x.id !== it.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2">🗑️</button>
        </div>
      ))}
      <Button onClick={add} variant="secondary" className="w-full border-2 border-dashed border-gray-200 bg-transparent hover:bg-gray-50 hover:border-blue-300 text-gray-400 hover:text-blue-500 py-4 font-bold rounded-2xl">
        + Adaugă Educație
      </Button>
    </div>
  );
}

function ExpEditor({ items, setItems }: { items: ExperienceItem[]; setItems: (v: ExperienceItem[]) => void }) {
  function up(id: string, p: Partial<ExperienceItem>) { setItems(items.map(it => it.id === id ? { ...it, ...p } : it)); }
  function add() { setItems([...items, { id: uid(), role: "", company: "", start: "", end: "" }]); }

  return (
    <div className="space-y-4">
      {items.map(it => (
        <div key={it.id} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 relative group transition-all hover:bg-white hover:shadow-lg">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Rol / Funcție"><TextInput value={it.role} onChange={e => up(it.id, { role: e.target.value })} placeholder="Ex: Intern Frontend" /></Field>
            <Field label="Companie / Org"><TextInput value={it.company} onChange={e => up(it.id, { company: e.target.value })} placeholder="Ex: Google" /></Field>
            <Field label="Început"><TextInput type="month" value={it.start} onChange={e => up(it.id, { start: e.target.value })} /></Field>
            <Field label="Sfârșit (opțional)"><TextInput type="month" value={it.end || ""} onChange={e => up(it.id, { end: e.target.value })} /></Field>
          </div>
          <button onClick={() => setItems(items.filter(x => x.id !== it.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2">🗑️</button>
        </div>
      ))}
      <Button onClick={add} variant="secondary" className="w-full border-2 border-dashed border-gray-200 bg-transparent hover:bg-gray-50 hover:border-blue-300 text-gray-400 hover:text-blue-500 py-4 font-bold rounded-2xl">
        + Adaugă Experiență
      </Button>
    </div>
  );
}

function OppsEditor({ items, setItems }: { items: OppRef[]; setItems: (v: OppRef[]) => void }) {
  function up(id: string, p: Partial<OppRef>) { setItems(items.map(it => it.id === id ? { ...it, ...p } : it)); }
  function add() { setItems([...items, { id: uid(), title: "", role: "", org: "", date: "", tags: [], cover: "", media: [], rating: 0, testimonial: "" }]); }
  return (
    <div className="space-y-4">
      {items.map(o => (
        <div key={o.id} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 relative group transition-all hover:bg-white hover:shadow-lg">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Field label="Titlu Proiect"><TextInput value={o.title} onChange={e => up(o.id, { title: e.target.value })} placeholder="Ex: Hackathon Winner" /></Field>
            <Field label="Rolul Tău"><TextInput value={o.role || ""} onChange={e => up(o.id, { role: e.target.value })} placeholder="Ex: Team Lead" /></Field>
            <Field label="Organizator/Loc"><TextInput value={o.org || ""} onChange={e => up(o.id, { org: e.target.value })} placeholder="Ex: Asociația X" /></Field>
            <Field label="Data"><TextInput type="month" value={o.date || ""} onChange={e => up(o.id, { date: e.target.value })} /></Field>
          </div>
          <Field label="Tag-uri (separate prin Enter)">
            <TextInput
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) up(o.id, { tags: Array.from(new Set([...(o.tags || []), v])) });
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              placeholder="Adaugă tehnologii sau skill-uri..."
            />
          </Field>
          {o.tags && o.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {o.tags.map(t => (
                <span key={t} className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-600 rounded-md">
                  #{t} <button className="ml-1 hover:text-red-500" onClick={() => up(o.id, { tags: o.tags?.filter(x => x !== t) })}>×</button>
                </span>
              ))}
            </div>
          )}
          <button onClick={() => setItems(items.filter(x => x.id !== o.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors p-2">🗑️</button>
        </div>
      ))}
      <Button onClick={add} variant="secondary" className="w-full border-2 border-dashed border-gray-200 bg-transparent hover:bg-gray-50 hover:border-blue-300 text-gray-400 hover:text-blue-500 py-4 font-bold rounded-2xl">
        + Adaugă Oportunitate / Proiect
      </Button>
    </div>
  );
}

function MediaEditor({ media, setMedia }: { media: Media[]; setMedia: (v: Media[]) => void }) {
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video type
    if (!file.type.startsWith("video/") && !/\.(mp4|webm|ogg|mov)$/i.test(file.name)) {
      alert("Te rugăm să încarci doar fișiere video (MP4, WebM, MOV).");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const resp = await fetch("/api/upload", { method: "POST", credentials: "include", body: formData });
      if (!resp.ok) throw new Error("Upload failed");
      const data = await resp.json();

      // Replace existing media with this single video
      setMedia([{ id: uid(), kind: "video", url: data.url, caption: "" }]);
    } catch (err) {
      console.error(err);
      alert("Eroare la încărcare video.");
    }
  }

  const currentVideo = media.find(m => m.kind === "video");

  return (
    <div className="space-y-6">
      {currentVideo ? (
        <div className="relative w-full max-w-2xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 border border-gray-100 bg-gray-50 group">
          <video
            src={currentVideo.url}
            className="w-full h-auto max-h-[500px] object-cover"
            controls
            playsInline
          />
          <button
            onClick={() => setMedia([])}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-500 hover:text-red-600 p-3 rounded-full shadow-lg transition-transform hover:scale-110 z-10"
            title="Șterge Video"
          >
            🗑️
          </button>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <label className="flex flex-col items-center justify-center w-full h-64 border-3 border-dashed border-gray-300 rounded-[2.5rem] cursor-pointer bg-gray-50 hover:bg-blue-50/50 hover:border-blue-400 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full grid place-items-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-sm">
                🎥
              </div>
              <p className="mb-2 text-lg font-bold text-gray-700 group-hover:text-blue-700">Încarcă Video de Prezentare</p>
              <p className="text-sm text-gray-400 font-medium">MP4, WebM sau MOV (Max 100MB)</p>
            </div>
            <input type="file" accept="video/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      )}
    </div>
  );
}

// ===================== Validation =====================
function validateStep(step: StepKey, p: ProfilePayload) {
  switch (step) {
    case "basics": return !!p.name && !!p.headline && !!p.bio && !!p.location;
    case "skills": return p.skills.length > 0;
    case "edu": return p.education.length > 0 && p.education.every(e => e.degree && e.school && e.start);
    case "exp": return p.experience.length > 0 && p.experience.every(x => x.role && x.company && x.start);
    case "opps": return p.opportunityRefs.length > 0 && p.opportunityRefs.every(o => o.title && o.role && o.date);
    case "portfolio": return p.portfolioMedia.length > 0;
    case "review": return true;
  }
}

// ===================== Main Component =====================
export default function StudentProfileWizard() {
  const router = useRouter();
  const [step, setStep] = useState<StepKey>("basics");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Profile State
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [social, setSocial] = useState<SocialLinks>({});
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [portfolioMedia, setPortfolioMedia] = useState<Media[]>([]);
  const [opportunityRefs, setOpportunityRefs] = useState<OppRef[]>([]);

  const payload: ProfilePayload = useMemo(() => ({ name, headline, bio, location, avatarDataUrl, skills, social, education, experience, portfolioMedia, opportunityRefs }), [name, headline, bio, location, avatarDataUrl, skills, social, education, experience, portfolioMedia, opportunityRefs]);

  // Autosave
  const debouncedStore = useDebouncedCallback((data: ProfilePayload) => {
    try {
      const email = localStorage.getItem("email") || "default";
      const key = `profileWizardDraft_${email}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch { }
  }, 600);
  useEffect(() => { debouncedStore(payload); }, [payload]);

  // Load Data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const d = await res.json();
          setName(d.name || "");
          setHeadline(d.headline || "");
          setBio(d.bio || "");
          setLocation(d.location || "");
          setAvatarDataUrl(d.avatarUrl || d.avatarDataUrl);
          setSkills(d.skills || []);
          setSocial(d.social || {});
          setEducation(d.education || []);
          setExperience(d.experience || []);
          setPortfolioMedia(d.portfolioMedia || []);
          setOpportunityRefs(d.opportunityRefs || []);
          return;
        }
      } catch (err) { console.error(err); }
      // Fallback
      try {
        const email = localStorage.getItem("email") || "default";
        const key = `profileWizardDraft_${email}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          const d = JSON.parse(raw) as ProfilePayload;
          setHeadline(d.headline || ""); setBio(d.bio || ""); setLocation(d.location || ""); setAvatarDataUrl(d.avatarDataUrl); setSkills(d.skills || []); setSocial(d.social || {});
        }
      } catch { }
    }
    loadData();
  }, []);

  const completeMap = useMemo(() => {
    const m: Record<StepKey, boolean> = { basics: false, skills: false, edu: false, exp: false, opps: false, portfolio: false, review: false };
    (Object.keys(m) as StepKey[]).forEach(k => (m[k] = validateStep(k, payload)));
    return m;
  }, [payload]);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await fetch("/api/users/me", { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
      setMsg("Salvat!");
    } catch { setMsg("Eroare la salvare"); }
    finally { setSaving(false); setTimeout(() => setMsg(null), 2000); }
  }

  const next = () => { const idx = STEPS.findIndex(s => s.key === step); if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key); };
  const prev = () => { const idx = STEPS.findIndex(s => s.key === step); if (idx > 0) setStep(STEPS[idx - 1].key); };

  return (
    <div className="min-h-screen bg-transparent pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">Editează Profilul</h1>
            <p className="text-lg text-gray-500 font-medium max-w-2xl">Arată lumii ce poți! Un profil complet îți aduce mai multe oportunități.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-right">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scor Profil</div>
              <div className="text-lg font-black text-blue-600">{pctProfile(payload)}%</div>
            </div>
            <div className="h-10 w-10 relative">
              <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="text-blue-500" strokeDasharray={`${pctProfile(payload)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[280px,1fr] gap-8 lg:gap-12 items-start justify-center">

          {/* Left Sidebar */}
          <div className="hidden lg:block sticky top-24">
            <Stepper current={step} completeMap={completeMap} go={setStep} />
          </div>

          {/* Mobile Stepper */}
          <div className="lg:hidden w-full overflow-x-auto pb-4 px-1 no-scrollbar scroll-smooth flex justify-start md:justify-center">
            <div className="flex gap-2">
              {STEPS.map((s, idx) => (
                <button key={s.key} onClick={() => setStep(s.key)} className={cls("flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all", step === s.key ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-white text-gray-500 border border-gray-100")}>
                  {idx + 1}. {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-full">

            {step === "basics" && (
              <Card title="Despre Tine" subtitle="Cine ești și cum pot oamenii să te contacteze.">
                <div className="grid md:grid-cols-[1fr,auto] gap-8">
                  <div className="space-y-6">
                    <Field label="Nume Complet" required><TextInput value={name} onChange={e => setName(e.target.value)} placeholder="Nume Prenume" /></Field>
                    <Field label="Headline" required hint="Scurtă descriere (ex: Student @ FII)"><TextInput value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Ex: Frontend Developer pasionat" /></Field>
                    <Field label="Bio" required><Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Povestea ta pe scurt..." /></Field>
                    <Field label="Locație" required><TextInput value={location} onChange={e => setLocation(e.target.value)} placeholder="Iași, România" /></Field>
                  </div>
                  <div className="flex flex-col items-center gap-6 min-w-[200px]">
                    <Field label="Poză Profil"><AvatarUploader value={avatarDataUrl} onChange={setAvatarDataUrl} /></Field>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Social & Contact</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <TextInput value={social.linkedin || ""} onChange={e => setSocial({ ...social, linkedin: e.target.value })} placeholder="LinkedIn URL" />
                    <TextInput value={social.github || ""} onChange={e => setSocial({ ...social, github: e.target.value })} placeholder="GitHub URL" />
                    <TextInput value={social.instagram || ""} onChange={e => setSocial({ ...social, instagram: e.target.value })} placeholder="Instagram URL" />
                    <TextInput value={social.website || ""} onChange={e => setSocial({ ...social, website: e.target.value })} placeholder="Website Personal" />
                  </div>
                </div>
              </Card>
            )}

            {step === "skills" && (
              <Card title="Skill-uri & Abilități" subtitle="Ce limbaje, framework-uri sau soft skills stăpânești?">
                <SkillsEditor skills={skills} setSkills={setSkills} />
              </Card>
            )}

            {step === "edu" && (
              <Card title="Educație" subtitle="Parcursul tău academic.">
                <EduEditor items={education} setItems={setEducation} />
              </Card>
            )}

            {step === "exp" && (
              <Card title="Experiență Profesională" subtitle="Job-uri, internship-uri sau voluntariat.">
                <ExpEditor items={experience} setItems={setExperience} />
              </Card>
            )}

            {step === "opps" && (
              <Card title="Proiecte & Oportunități" subtitle="Participări la hackathoane, proiecte personale sau evenimente.">
                <OppsEditor items={opportunityRefs} setItems={setOpportunityRefs} />
              </Card>
            )}

            {step === "portfolio" && (
              <Card title="Video CV" subtitle="O scurtă prezentare video despre tine. Arată-le cine ești!">
                <MediaEditor media={portfolioMedia} setMedia={setPortfolioMedia} />
              </Card>
            )}

            {step === "review" && (
              <Card title="Recapitulare" subtitle="Verifică cum arată profilul tău înainte de a salva.">
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                      <img src={avatarDataUrl || "https://placehold.co/100"} className="h-16 w-16 rounded-2xl object-cover shadow-sm bg-white" />
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{name}</h3>
                        <p className="text-blue-600 font-medium">{headline}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{bio || "Fără descriere..."}</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.slice(0, 5).map(s => <Pill key={s}>{s}</Pill>)}
                      {skills.length > 5 && <span className="text-xs text-gray-400 font-medium py-1.5 px-2">+{skills.length - 5} altele</span>}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800">Timeline</h4>
                    <Timeline education={education} experience={experience} opps={opportunityRefs} />
                  </div>
                </div>
              </Card>
            )}

            {/* Floating Action Bar */}
            <div className="sticky bottom-6 mt-8 z-30 px-4 md:px-0">
              <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-900/10 rounded-2xl p-2 px-4 flex items-center justify-between max-w-3xl mx-auto ring-1 ring-black/5">
                <Button variant="ghost" onClick={prev} disabled={step === "basics"} className={cls(step === "basics" ? "opacity-0" : "", "px-2 md:px-4")}>
                  <span className="hidden md:inline">← Înapoi</span>
                  <span className="md:hidden text-lg">←</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button onClick={save} variant="primary" disabled={saving} className="min-w-[40px] md:min-w-[140px] px-3 md:px-6 text-sm md:text-base">
                    {saving ? <span className="animate-pulse">...</span> : <span className="hidden md:inline">Salvează</span>}
                    <span className="md:hidden text-lg">💾</span>
                  </Button>
                  {step !== "review" && (
                    <Button onClick={next} variant="secondary" className="bg-gray-100 hover:bg-gray-200 px-3 md:px-6">
                      <span className="hidden md:inline">Continuă →</span>
                      <span className="md:hidden text-lg">→</span>
                    </Button>
                  )}
                  {step === "review" && (
                    <Button onClick={() => router.push("/student/profile/preview")} variant="secondary" className="bg-gray-100 hover:bg-gray-200 px-3 md:px-6">
                      <span className="hidden md:inline">Previzualizează</span>
                    </Button>
                  )}
                </div>

                {msg && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-emerald-500 text-white px-6 py-2 rounded-full shadow-lg text-sm font-bold animate-in slide-in-from-bottom-2 fade-in whitespace-nowrap z-50">
                    {msg}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}