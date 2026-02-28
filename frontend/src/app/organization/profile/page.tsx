"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import BannerUploader from "./BannerUploader";
import ApiClient from "../../../lib/api/client";

// Types
type SocialLinks = { facebook?: string; instagram?: string; website?: string };
type KeyPerson = { id: string; name: string; role: string; responsibilities?: string };
type EventItem = { id: string; title: string; date: string; description?: string; tags?: string[] };
type ContactPerson = { id: string; name: string; email: string; phone: string };
type Media = { id: string; kind: "image" | "video"; url: string; caption?: string };

type OrgProfilePayload = {
  name: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  volunteers: number;
  social: SocialLinks;
  events: EventItem[];
  keyPeople: KeyPerson[];
  contactPersons: ContactPerson[];
  media: Media[];
};

// Utils
const uid = () => Math.random().toString(36).slice(2, 9);
const cls = (...x: Array<string | false | undefined | null>) => x.filter(Boolean).join(" ");

// Progress helpers
function pctProfile(p: OrgProfilePayload) {
  const checks = [
    !!p.name, !!p.headline, !!p.bio, !!p.avatarUrl,
    !!p.location, !!p.volunteers, p.social && Object.keys(p.social).length > 0,
    p.events.length > 0, p.keyPeople.length > 0, p.contactPersons.length > 0, p.media.length > 0
  ];
  return Math.round(checks.reduce((a, b) => a + (b ? 1 : 0), 0) / checks.length * 100);
}

// UI Atoms
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

// Stepper
const STEPS = [
  { key: "basics", label: "Date de bază", icon: "🏢" },
  { key: "events", label: "Oportunități", icon: "🚀" },
  { key: "people", label: "Echipa", icon: "👥" },
  { key: "contact", label: "Contact", icon: "📞" },
  { key: "media", label: "Media & Vizual", icon: "📸" },
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

// Avatar uploader
function AvatarUploader({ value, onChange }: { value?: string; onChange: (dataUrl?: string) => void }) {
  async function handleFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const data = await ApiClient.post<{ url: string }>("/api/upload", formData);
      onChange(data.url);
    } catch (e) { console.error(e); }
  }
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="relative">
        <div className={cls("h-32 w-32 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 group-hover:rotate-3 group-hover:scale-105 border-4 border-white", !value && "bg-gray-100 flex items-center justify-center")}>
          {value ? <img src={value} alt="avatar" className="h-full w-full object-cover" /> : <span className="text-3xl text-gray-300">🏢</span>}
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

// Single Video Uploader
function SingleVideoUploader({ media, setMedia }: { media: Media[]; setMedia: (v: Media[]) => void }) {
  // We only care about the first video if it exists
  const video = media.find(m => m.kind === 'video');

  async function handleFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const data = await ApiClient.post<{ url: string }>("/api/upload", formData);
      // Replace entire media array with just this new video
      setMedia([{ id: uid(), kind: "video", url: data.url, caption: "Video de Prezentare" }]);
    } catch (e) { console.error(e); }
  }

  return (
    <div className="space-y-4">
      {video ? (
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg ring-1 ring-black/10 aspect-video group">
          <video src={video.url} className="w-full h-full object-contain" controls />
          <button
            onClick={() => setMedia([])}
            className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 transform scale-90 hover:scale-100"
            title="Șterge Video"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        <label className="block w-full aspect-video rounded-3xl border-3 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer group relative overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 grid place-items-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
              🎥
            </div>
            <div className="text-center">
              <p className="text-gray-900 font-bold text-lg">Încarcă Video de Prezentare</p>
              <p className="text-gray-500 text-sm mt-1">MP4, WebM (Max 50MB)</p>
            </div>
          </div>
          <input type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
      )}
    </div>
  );
}

// Main
export default function OrganizationProfileWizard() {
  const router = useRouter();
  const [step, setStep] = useState<StepKey>("basics");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [profile, setProfile] = useState<OrgProfilePayload>({
    name: "", headline: "", bio: "", avatarUrl: "", bannerUrl: "", location: "", volunteers: 0,
    social: {}, events: [], keyPeople: [{ id: uid(), name: "", role: "", responsibilities: "" }],
    contactPersons: [{ id: uid(), name: "", email: "", phone: "" }], media: [],
  });

  const handleChange = (field: keyof OrgProfilePayload, value: any) => setProfile(prev => ({ ...prev, [field]: value }));

  // Autosave & Fetch logic
  useEffect(() => {
    async function init() {
      try {
        const data = await ApiClient.get<any>("/api/organizations/users/profile");
        if (data) {
          setProfile(p => ({
            ...p, ...data,
            keyPeople: data.keyPeople ?? data.key_people ?? [], contactPersons: data.contactPersons ?? data.contact_persons ?? [],
            avatarUrl: data.avatar_url ?? data.avatarUrl ?? "", bannerUrl: data.banner_url ?? data.bannerUrl ?? "",
          }));
        }
      } catch { }
    }
    init();
  }, []);

  async function save() {
    setSaving(true);
    try {
      await ApiClient.post("/api/organizations/users/profile", profile);
      setMsg("Salvat cu succes!");
    } catch { setMsg("Eroare la salvare."); }
    finally { setSaving(false); setTimeout(() => setMsg(null), 3000); }
  }

  // Completeness logic
  function validateStep(s: StepKey, p: OrgProfilePayload) {
    switch (s) {
      case "basics": return !!p.name && !!p.headline && !!p.bio && !!p.avatarUrl && !!p.location;
      case "events": return true;
      case "people": return p.keyPeople.length > 0 && p.keyPeople.every(x => x.name && x.role);
      case "contact": return p.contactPersons.length > 0 && p.contactPersons.every(x => x.email);
      case "media": return true;
      case "review": return true;
    }
  }

  const completeMap = useMemo(() => {
    const m: Record<StepKey, boolean> = { basics: false, events: false, people: false, contact: false, media: false, review: false };
    (Object.keys(m) as StepKey[]).forEach(k => (m[k] = validateStep(k, profile)));
    return m;
  }, [profile]);

  const next = () => { const idx = STEPS.findIndex(s => s.key === step); if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key); };
  const prev = () => { const idx = STEPS.findIndex(s => s.key === step); if (idx > 0) setStep(STEPS[idx - 1].key); };

  return (
    <div className="min-h-screen bg-transparent pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">Editează Profilul</h1>
            <p className="text-lg text-gray-500 font-medium max-w-2xl">Construiește o prezență puternică pentru organizația ta. Completează toate detaliile pentru a atrage cei mai buni voluntari.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-right">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scor Profil</div>
              <div className="text-lg font-black text-blue-600">{pctProfile(profile)}%</div>
            </div>
            <div className="h-10 w-10 relative">
              <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="text-blue-500" strokeDasharray={`${pctProfile(profile)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[280px,1fr] gap-8 lg:gap-12 items-start justify-center">
          {/* Left Sidebar */}
          <div className="hidden lg:block">
            <Stepper current={step} completeMap={completeMap} go={setStep} />
          </div>

          {/* Stepper Mobile - Horizontal scroll but centered container */}
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
              <Card title="Date de Identitate" subtitle="Informațiile esențiale despre organizația ta.">
                <div className="grid md:grid-cols-[1fr,auto] gap-8">
                  <div className="space-y-6">
                    <Field label="Numele Organizației" required><TextInput value={profile.name} onChange={e => handleChange("name", e.target.value)} placeholder="Ex: Asociația Tinerilor..." /></Field>
                    <Field label="Headline (Slogan)" required><TextInput value={profile.headline || ""} onChange={e => handleChange("headline", e.target.value)} placeholder="Motto-ul vostru scurt" /></Field>
                    <Field label="Descriere (Bio)" required><Textarea value={profile.bio || ""} onChange={e => handleChange("bio", e.target.value)} placeholder="Povestea voastră pe scurt..." /></Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Locație" required><TextInput value={profile.location || ""} onChange={e => handleChange("location", e.target.value)} placeholder="Oraș, Țară" /></Field>
                      <Field label="Nr. Voluntari"><TextInput type="number" min="0" value={profile.volunteers || ""} onChange={e => handleChange("volunteers", parseInt(e.target.value) || 0)} placeholder="Estimativ" /></Field>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-6 min-w-[200px]">
                    <Field label="Avatar Oficial"><AvatarUploader value={profile.avatarUrl} onChange={v => handleChange("avatarUrl", v)} /></Field>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Link-uri Sociale</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <TextInput value={profile.social.website || ""} onChange={e => handleChange("social", { ...profile.social, website: e.target.value })} placeholder="Website (https://...)" />
                    <TextInput value={profile.social.facebook || ""} onChange={e => handleChange("social", { ...profile.social, facebook: e.target.value })} placeholder="Facebook" />
                    <TextInput value={profile.social.instagram || ""} onChange={e => handleChange("social", { ...profile.social, instagram: e.target.value })} placeholder="Instagram" />
                  </div>
                </div>
              </Card>
            )}

            {step === "events" && (
              <Card title="Oportunități Recurente" subtitle="Evenimente sau programe pe care le organizați frecvent.">
                <div className="space-y-4">
                  {profile.events.map((ev, i) => (
                    <div key={ev.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 relative group transition-all hover:bg-white hover:shadow-lg">
                      <div className="grid md:grid-cols-[2fr,1fr] gap-4">
                        <Field label="Nume Eveniment"><TextInput value={ev.title} onChange={e => handleChange("events", profile.events.map(x => x.id === ev.id ? { ...x, title: e.target.value } : x))} placeholder="Ex: Tabăra de Vară" /></Field>
                        <Field label="Data"><TextInput type="month" value={ev.date} onChange={e => handleChange("events", profile.events.map(x => x.id === ev.id ? { ...x, date: e.target.value } : x))} /></Field>
                      </div>
                      <div className="mt-2">
                        <TextInput value={ev.description || ""} onChange={e => handleChange("events", profile.events.map(x => x.id === ev.id ? { ...x, description: e.target.value } : x))} placeholder="Scurtă descriere a impactului..." />
                      </div>
                      <button onClick={() => handleChange("events", profile.events.filter(x => x.id !== ev.id))} className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100">🗑️</button>
                    </div>
                  ))}
                  <Button onClick={() => handleChange("events", [...profile.events, { id: uid(), title: "", date: "", description: "" }])} variant="secondary" className="w-full py-4 border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-400 text-gray-400 hover:text-blue-500 text-lg font-bold group">
                    <span className="group-hover:scale-110 transition-transform text-2xl mr-2">+</span> Adaugă Eveniment
                  </Button>
                </div>
              </Card>
            )}

            {step === "people" && (
              <Card title="Echipa Noastră" subtitle="Oamenii cheie care fac magia să se întâmple.">
                <div className="grid md:grid-cols-2 gap-4">
                  {profile.keyPeople.map((p) => (
                    <div key={p.id} className="p-5 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:shadow-xl hover:bg-white transition-all relative">
                      <div className="flex gap-4 items-center mb-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-100 to-white grid place-items-center text-xl shadow-inner">👤</div>
                        <div className="flex-1">
                          <input className="bg-transparent font-bold text-lg text-gray-900 placeholder:text-gray-400 w-full outline-none" placeholder="Nume" value={p.name} onChange={e => handleChange("keyPeople", profile.keyPeople.map(x => x.id === p.id ? { ...x, name: e.target.value } : x))} />
                          <input className="bg-transparent text-sm font-medium text-blue-600 placeholder:text-blue-300 w-full outline-none" placeholder="Rol / Funcție" value={p.role} onChange={e => handleChange("keyPeople", profile.keyPeople.map(x => x.id === p.id ? { ...x, role: e.target.value } : x))} />
                        </div>
                      </div>
                      <Textarea placeholder="Responsabilități..." value={p.responsibilities || ""} onChange={e => handleChange("keyPeople", profile.keyPeople.map(x => x.id === p.id ? { ...x, responsibilities: e.target.value } : x))} className="min-h-[80px] bg-white text-sm" />
                      <button onClick={() => handleChange("keyPeople", profile.keyPeople.filter(x => x.id !== p.id))} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors">✕</button>
                    </div>
                  ))}
                  <button onClick={() => handleChange("keyPeople", [...profile.keyPeople, { id: uid(), name: "", role: "", responsibilities: "" }])} className="p-5 rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 min-h-[200px] text-gray-400 hover:text-blue-500">
                    <span className="text-3xl">+</span>
                    <span className="font-bold">Adaugă Membru</span>
                  </button>
                </div>
              </Card>
            )}

            {step === "contact" && (
              <Card title="Informații de Contact" subtitle="Cine poate fi contactat pentru parteneriate?">
                <div className="space-y-4">
                  {profile.contactPersons.map((p) => (
                    <div key={p.id} className="p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center group">
                      <div className="flex-1 w-full grid md:grid-cols-3 gap-4">
                        <TextInput value={p.name} onChange={e => handleChange("contactPersons", profile.contactPersons.map(x => x.id === p.id ? { ...x, name: e.target.value } : x))} placeholder="Nume Contact" />
                        <TextInput value={p.email} onChange={e => handleChange("contactPersons", profile.contactPersons.map(x => x.id === p.id ? { ...x, email: e.target.value } : x))} placeholder="Email" />
                        <TextInput value={p.phone} onChange={e => handleChange("contactPersons", profile.contactPersons.map(x => x.id === p.id ? { ...x, phone: e.target.value } : x))} placeholder="Telefon" />
                      </div>
                      <Button variant="ghost" onClick={() => handleChange("contactPersons", profile.contactPersons.filter(x => x.id !== p.id))} className="text-red-400 hover:bg-red-50 hover:text-red-600 px-3">Șterge</Button>
                    </div>
                  ))}
                  <Button onClick={() => handleChange("contactPersons", [...profile.contactPersons, { id: uid(), name: "", email: "", phone: "" }])} variant="secondary" className="w-full">+ Adaugă Persoană Contact</Button>
                </div>
              </Card>
            )}

            {step === "media" && (
              <Card title="Media & Vizual" subtitle="Personalizează aspectul paginii voastre.">
                <BannerUploader value={profile.bannerUrl} onChange={v => handleChange("bannerUrl", v)} />
                <div className="h-8"></div>
                <h4 className="font-bold text-gray-800 mb-4">Video de Prezentare</h4>
                <SingleVideoUploader media={profile.media} setMedia={v => handleChange("media", v)} />
              </Card>
            )}

            {step === "review" && (
              <Card title="Suntem gata?" subtitle="Verifică cum arată totul înainte de a salva.">
                <div className="rounded-3xl bg-gray-50 p-6 md:p-10 border border-gray-100 text-center">
                  <div className="mx-auto w-32 h-32 rounded-[2rem] bg-white p-1 shadow-xl mb-6 overflow-hidden">
                    <img src={profile.avatarUrl || "https://placehold.co/200"} className="w-full h-full object-cover rounded-[1.8rem]" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">{profile.name || "Nume Organizație"}</h2>
                  <p className="text-xl text-blue-600 font-medium mb-6">{profile.headline || "Headline..."}</p>
                  <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">{profile.bio || "Descriere..."}</p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => router.push("/organization/profile/preview")} variant="secondary">👀 Previzualizează Profil Public</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Bottom Actions */}
            <div className="sticky bottom-6 mt-8 z-30 px-4 md:px-0">
              <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-900/10 rounded-2xl p-2 px-4 flex items-center justify-between max-w-3xl mx-auto ring-1 ring-black/5">
                <Button variant="ghost" onClick={prev} disabled={step === "basics"} className={cls(step === "basics" ? "opacity-0" : "", "px-2 md:px-4")}>
                  <span className="hidden md:inline">← Înapoi</span>
                  <span className="md:hidden text-lg">←</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button onClick={save} variant="primary" disabled={saving} className="min-w-[40px] md:min-w-[140px] px-3 md:px-6 text-sm md:text-base">
                    {saving ? <span className="animate-pulse">...</span> : <span className="hidden md:inline">Salvează Modificări</span>}
                    <span className="md:hidden text-lg">💾</span>
                  </Button>
                  {step !== "review" && (
                    <Button onClick={next} variant="secondary" className="bg-gray-100 hover:bg-gray-200 px-3 md:px-6">
                      <span className="hidden md:inline">Continuă →</span>
                      <span className="md:hidden text-lg">→</span>
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
