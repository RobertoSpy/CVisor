"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import BannerUploader from "./BannerUploader"

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
const cls = (...x: Array<string | false | undefined>) => x.filter(Boolean).join(" ");

// Progress helpers
function pctProfile(p: OrgProfilePayload) {
  const checks = [
    !!p.name, !!p.headline, !!p.bio, !!p.avatarUrl,
    !!p.location, !!p.volunteers, p.social && Object.keys(p.social).length > 0,
    p.events.length > 0, p.keyPeople.length > 0, p.contactPersons.length > 0, p.media.length > 0
  ];
  return Math.round(checks.reduce((a, b) => a + (b ? 1 : 0), 0) / checks.length * 100);
}
function xpOf(p: OrgProfilePayload) {
  return (p.volunteers || 0) * 5 + (p.keyPeople.length * 10) + (p.events.length * 15) + (p.media.length * 5);
}

// Debounce helper
function useDebouncedCallback<T extends any[]>(fn: (...args: T) => void, delay = 600) {
  const t = useRef<NodeJS.Timeout | null>(null);
  return (...args: T) => { if (t.current) clearTimeout(t.current); t.current = setTimeout(() => fn(...args), delay); };
}

// UI Atoms
function Button({ children, className, onClick, disabled, type = "button" }: { children: React.ReactNode; className?: string; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls("px-4 py-2.5 rounded-xl text-sm shadow-sm transition inline-flex items-center justify-center", disabled ? "bg-black/10 text-gray-500 cursor-not-allowed" : "bg-primary text-white hover:bg-accent", className)}>{children}</button>
  );
}
function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button type="button" onClick={onClick} className="px-3 py-2 rounded-xl text-sm bg-black/5 hover:bg-black/10">{children}</button>;
}
function Field({ label, children, required = false, hint, error }: { label: string; children: React.ReactNode; required?: boolean; hint?: string; error?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label className="text-sm text-gray-800 font-medium">{label}</label>
        {required && <span className="text-[11px] px-1 py-0.5 rounded bg-amber-100 text-amber-700">obligatoriu</span>}
      </div>
      {children}
      {hint && <p className="text-[12px] text-gray-500 mt-1">{hint}</p>}
      {error && <p className="text-[12px] text-accent mt-1">{error}</p>}
    </div>
  );
}
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cls("w-full rounded-xl border border-black/10 bg-white/90 px-3.5 py-3 outline-none focus:ring-2 focus:ring-primary/30 transition placeholder:text-gray-400", props.className)} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cls("w-full rounded-xl border border-black/10 bg-white/90 px-3.5 py-3 min-h-[120px] outline-none focus:ring-2 focus:ring-primary/30 transition placeholder:text-gray-400", props.className)} />;
}
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cls("bg-white/90 backdrop-blur rounded-2xl p-5 ring-1 ring-black/10 shadow-[0_6px_24px_rgba(0,0,0,0.06)]", className)}>{children}</div>;
}
function Pill({ children }: { children: React.ReactNode }) { return <span className="text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary">{children}</span>; }
function CheckRow({ ok, label, sub }: { ok: boolean; label: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={cls("mt-0.5 h-4 w-4 rounded-full grid place-items-center text-[10px]", ok ? "bg-emerald-500 text-white" : "bg-black/10 text-gray-500")}>{ok ? "✓" : "!"}</div>
      <div className="text-sm">
        <div className="font-medium">{label}</div>
        {sub && <div className="text-gray-500 text-xs">{sub}</div>}
      </div>
    </div>
  );
}

// Stepper
const STEPS = [
  { key: "basics", label: "Date de bază" },
  { key: "events", label: "Oportunități & Evenimente" },
  { key: "people", label: "Persoane cheie" },
  { key: "contact", label: "Contact" },
  { key: "media", label: "Media" },
  { key: "review", label: "Verificare & Salvare" },
] as const;
type StepKey = typeof STEPS[number]["key"];

function Stepper({ current, completeMap, go }: { current: StepKey; completeMap: Record<StepKey, boolean>; go: (k: StepKey) => void }) {
  return (
    <nav className="sticky top-4 space-y-2">
      {STEPS.map((s, idx) => {
        const done = completeMap[s.key];
        const isNow = current === s.key;
        return (
          <button key={s.key} onClick={() => go(s.key)} className={cls("w-full text-left px-3 py-3 rounded-xl ring-1", isNow ? "bg-primary text-white ring-primary/60 shadow" : "bg-white ring-black/10 hover:bg-black/5")}>
            <div className="flex items-center gap-3">
              <div className={cls("h-6 w-6 rounded-full grid place-items-center text-xs", done ? "bg-emerald-500 text-white" : "bg-black/10 text-gray-600")}>{done ? "✓" : idx + 1}</div>
              <div className="text-sm font-medium">{s.label}</div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

// Avatar uploader ca la student
function AvatarUploader({ value, onChange }: { value?: string; onChange: (dataUrl?: string) => void }) {
  async function handleFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch("/api/upload", { method: "POST", credentials: "include", body: formData });
    const data = await resp.json();
    onChange(data.url);
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-28 w-28 rounded-full ring-4 ring-primary overflow-hidden bg-black/5 shadow-lg mb-2 flex items-center justify-center">
        {value ? <img src={value} alt="avatar" className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center text-xs text-gray-500">Avatar</div>}
      </div>
      <div className="flex gap-2">
        <label className="inline-flex items-center gap-2 bg-secondary text-white px-3.5 py-2.5 rounded-xl hover:bg-accent transition cursor-pointer shadow">Încarcă
          <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </label>
        {value && <button type="button" onClick={() => onChange(undefined)} className="text-sm underline underline-offset-4 decoration-primary hover:text-primary">Elimină</button>}
      </div>
    </div>
  );
}

// Media uploader
function MediaEditor({ media, setMedia }: { media: Media[]; setMedia: (v: Media[]) => void }) {
  async function add(files: FileList | null) {
    if (!files) return;
    const next: Media[] = [];
    for (const f of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", f);
      const resp = await fetch("/api/upload", { method: "POST", credentials: "include", body: formData });
      const data = await resp.json();
      const url = data.url;
      const isVideo = /video/.test(f.type) || /\.(mp4|webm|ogg)$/i.test(f.name);
      next.push({ id: uid(), kind: isVideo ? "video" : "image", url, caption: f.name });
    }
    setMedia([...media, ...next]);
  }
  function remove(id: string) { setMedia(media.filter(m => m.id !== id)); }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {media.map(m => (
          <div key={m.id} className="relative rounded-xl overflow-hidden ring-1 ring-black/10 bg-black/5">
            {m.kind === 'image' ? <img src={m.url} className="h-40 w-full object-cover" /> : <video src={m.url} className="h-40 w-full object-cover" controls />}
            <button onClick={() => remove(m.id)} className="absolute top-2 right-2 text-xs bg-white/90 rounded px-2 py-1">Șterge</button>
            {m.caption && <div className="text-xs text-gray-600 text-center">{m.caption}</div>}
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2.5 rounded-xl hover:bg-accent transition cursor-pointer shadow">Adaugă media
        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => add(e.target.files)} />
      </label>
    </div>
  );
}

// Main
export default function OrganizationProfileWizard() {
  const router = useRouter();
  const [step, setStep] = useState<StepKey>("basics");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // State with 1 default element for keyPeople/contactPersons
  const [profile, setProfile] = useState<OrgProfilePayload>({
    name: "",
    headline: "",
    bio: "",
    avatarUrl: "",
    bannerUrl: "",
    location: "",
    volunteers: 0,
    social: {},
    events: [],
    keyPeople: [{ id: uid(), name: "", role: "", responsibilities: "" }],
    contactPersons: [{ id: uid(), name: "", email: "", phone: "" }],
    media: [],
  });

  const handleChange = (field: keyof OrgProfilePayload, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const completeMap = useMemo(() => {
    const m: Record<StepKey, boolean> = { basics: false, events: false, people: false, contact: false, media: false, review: false };
    (Object.keys(m) as StepKey[]).forEach(k => (m[k] = validateStep(k, profile)));
    return m;
  }, [profile]);

  // Autosave local
  useEffect(() => { try { localStorage.setItem("orgProfileDraft", JSON.stringify(profile)); } catch { } }, [profile]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const resp = await fetch("/api/organizations/users/profile", {
          credentials: "include"
        });
        if (resp.ok) {
          const data = await resp.json();
          setProfile(prev => ({
            ...prev,
            ...data,
            keyPeople: data.keyPeople ?? data.key_people ?? [],
            contactPersons: data.contactPersons ?? data.contact_persons ?? [],
            events: data.events ?? [],
            media: data.media ?? [],
            social: data.social ?? {},
            avatarUrl: data.avatar_url ?? data.avatarUrl ?? "",
            bannerUrl: data.banner_url ?? data.bannerUrl ?? data.banner_image ?? "",
          }));

          if (!data.name) {
            fetchAuthName();
          }
        } else {
          fetchAuthName();
          const raw = localStorage.getItem("orgProfileDraft");
          if (raw) setProfile(JSON.parse(raw));
        }
      } catch {
        fetchAuthName();
        const raw = localStorage.getItem("orgProfileDraft");
        if (raw) setProfile(JSON.parse(raw));
      }
    }

    async function fetchAuthName() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const user = await res.json();
          if (user.full_name) {
            setProfile(prev => ({ ...prev, name: user.full_name }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch auth name", e);
      }
    }

    fetchProfile();
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      await fetch("/api/organizations/users/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profile)
      });
      setMsg("Salvat!");
    } catch {
      setMsg("Eroare la salvare");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 2000);
    }
  }

  const pct = pctProfile(profile);
  const xp = xpOf(profile);

  function next() { const idx = STEPS.findIndex(s => s.key === step); const after = STEPS[idx + 1]?.key; if (after) setStep(after); }
  function prev() { const idx = STEPS.findIndex(s => s.key === step); const before = STEPS[idx - 1]?.key; if (before) setStep(before); }

  // Keyboard Ctrl/⌘+S
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [profile]);

  // Step content
  return (
    <div className="grid lg:grid-cols-[260px,1fr] gap-6 mt-10">
      {/* Left: Stepper + checklist */}
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-2"><div className="text-sm text-gray-600">Completitudine</div><div className="text-sm font-medium">{pct}%</div></div>
          <div className="h-2 bg-black/10 rounded-full overflow-hidden mb-2">
            <div
              className={"h-full transition-all duration-300 " + (pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-primary" : "bg-accent")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs text-gray-600">XP: <span className="font-medium">{xp}</span></div>
        </Card>
        <Stepper current={step} completeMap={completeMap} go={setStep} />
        <Card>
          <div className="text-sm font-medium mb-3">Checklist global</div>
          <div className="space-y-2">
            <CheckRow ok={!!profile.name} label="Nume" />
            <CheckRow ok={!!profile.headline} label="Headline" />
            <CheckRow ok={!!profile.bio} label="Bio" />
            <CheckRow ok={!!profile.avatarUrl} label="Avatar" />
            <CheckRow ok={!!profile.location} label="Locație" />
            <CheckRow ok={!!profile.volunteers} label="Voluntari" />
            <CheckRow ok={profile.social && Object.keys(profile.social).length > 0} label="Social" />
            <CheckRow ok={profile.events.length > 0} label="Oportunități/Evenimente" />
            <CheckRow ok={profile.keyPeople.length > 0} label="Persoane cheie" />
            <CheckRow ok={profile.contactPersons.length > 0} label="Contact" />
            <CheckRow ok={profile.media.length > 0} label="Media" />
          </div>
        </Card>
      </div>

      {/* Right: Step content */}
      <div className="space-y-6">
        {step === "basics" && (
          <Card>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Field label="Nume organizație" required><TextInput value={profile.name} onChange={e => handleChange("name", e.target.value)} placeholder="Ex: Asociația Exemplu" /></Field>
                <Field label="Headline" required hint="Scurt slogan"><TextInput value={profile.headline} onChange={e => handleChange("headline", e.target.value)} placeholder="Facem educație altfel!" /></Field>
                <Field label="Bio" required hint="2‑3 propoziții scurte"><Textarea value={profile.bio} onChange={e => handleChange("bio", e.target.value)} placeholder="Suntem o echipă de tineri entuziaști..." /></Field>
                <Field label="Locație" required><TextInput value={profile.location} onChange={e => handleChange("location", e.target.value)} placeholder="Iași, RO" /></Field>
                <Field label="Număr voluntari">
                  <TextInput
                    type="number"
                    min={0}
                    value={profile.volunteers ? profile.volunteers.toString() : ""}
                    onChange={e => {
                      const val = e.target.value.replace(/^0+/, "");
                      handleChange("volunteers", val === "" ? 0 : Number(val));
                    }}
                    placeholder="ex: 23"
                  />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="Facebook"><TextInput value={profile.social.facebook || ""} onChange={e => handleChange("social", { ...profile.social, facebook: e.target.value })} placeholder="https://facebook.com/org" /></Field>
                  <Field label="Instagram"><TextInput value={profile.social.instagram || ""} onChange={e => handleChange("social", { ...profile.social, instagram: e.target.value })} placeholder="https://instagram.com/org" /></Field>
                  <Field label="Website"><TextInput value={profile.social.website || ""} onChange={e => handleChange("social", { ...profile.social, website: e.target.value })} placeholder="https://org.ro" /></Field>
                </div>
              </div>
              <div className="space-y-4">
                <Field label="Avatar organizație" required>
                  <AvatarUploader value={profile.avatarUrl} onChange={v => handleChange("avatarUrl", v)} />
                </Field>
                <Field label="Banner organizație">
                  <BannerUploader value={profile.bannerUrl} onChange={v => handleChange("bannerUrl", v)} />
                </Field>
                <Card>
                  <div className="text-sm font-medium mb-2">Ce trebuie să bifezi aici</div>
                  <ul className="text-sm text-gray-600 list-disc ml-4 space-y-1">
                    <li>Completează nume, headline, bio, locație și voluntari</li>
                    <li>Adaugă linkuri sociale și avatar</li>
                  </ul>
                </Card>
              </div>
            </div>
            <Button className="mt-6" onClick={next}>Continuă</Button>
          </Card>
        )}

        {step === "events" && (
          <Card>
            <div className="space-y-3">
              {profile.events.map(ev => (
                <div key={ev.id} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <TextInput
                    value={ev.title}
                    onChange={e => handleChange("events", profile.events.map(x => x.id === ev.id ? { ...x, title: e.target.value } : x))}
                    placeholder="Titlu oportunitate/Eveniment"
                  />
                  <TextInput
                    type="month"
                    value={ev.date}
                    onChange={e => handleChange("events", profile.events.map(x => x.id === ev.id ? { ...x, date: e.target.value } : x))}
                    placeholder="Lună/An"
                  />
                  <TextInput
                    value={ev.description || ""}
                    onChange={e => handleChange("events", profile.events.map(x => x.id === ev.id ? { ...x, description: e.target.value } : x))}
                    placeholder="Descriere"
                  />
                </div>
              ))}
              <Button onClick={() => handleChange("events", [...profile.events, { id: uid(), title: "", date: "", description: "" }])}>+ Adaugă oportunitate/eveniment</Button>
            </div>
            <Button className="mt-6" onClick={next}>Continuă</Button>
          </Card>
        )}

        {step === "people" && (
          <Card>
            <div className="space-y-3">
              {profile.keyPeople.map((pers, idx) => (
                <div key={pers.id} className="grid grid-cols-3 gap-3 items-center">
                  <TextInput value={pers.name} onChange={e => handleChange("keyPeople", profile.keyPeople.map(x => x.id === pers.id ? { ...x, name: e.target.value } : x))} placeholder="Nume" />
                  <TextInput value={pers.role} onChange={e => handleChange("keyPeople", profile.keyPeople.map(x => x.id === pers.id ? { ...x, role: e.target.value } : x))} placeholder="Rol" />
                  <TextInput value={pers.responsibilities || ""} onChange={e => handleChange("keyPeople", profile.keyPeople.map(x => x.id === pers.id ? { ...x, responsibilities: e.target.value } : x))} placeholder="Responsabilități" />
                  {profile.keyPeople.length > 1 && (
                    <Button type="button" onClick={() => handleChange("keyPeople", profile.keyPeople.filter(x => x.id !== pers.id))}>Șterge</Button>
                  )}
                </div>
              ))}
              <Button onClick={() => handleChange("keyPeople", [...profile.keyPeople, { id: uid(), name: "", role: "", responsibilities: "" }])}>+ Adaugă persoană</Button>
            </div>
            <Button className="mt-6" onClick={next}>Continuă</Button>
          </Card>
        )}

        {step === "contact" && (
          <Card>
            <div className="space-y-3">
              {profile.contactPersons.map((person, idx) => (
                <div key={person.id} className="grid grid-cols-3 gap-3 items-center">
                  <TextInput value={person.name} onChange={e => handleChange("contactPersons", profile.contactPersons.map(x => x.id === person.id ? { ...x, name: e.target.value } : x))} placeholder="Nume" />
                  <TextInput value={person.email} onChange={e => handleChange("contactPersons", profile.contactPersons.map(x => x.id === person.id ? { ...x, email: e.target.value } : x))} placeholder="Email" />
                  <TextInput value={person.phone} onChange={e => handleChange("contactPersons", profile.contactPersons.map(x => x.id === person.id ? { ...x, phone: e.target.value } : x))} placeholder="Telefon" />
                  {profile.contactPersons.length > 1 && (
                    <Button type="button" onClick={() => handleChange("contactPersons", profile.contactPersons.filter(x => x.id !== person.id))}>Șterge</Button>
                  )}
                </div>
              ))}
              <Button onClick={() => handleChange("contactPersons", [...profile.contactPersons, { id: uid(), name: "", email: "", phone: "" }])}>+ Adaugă persoană contact</Button>
            </div>
            <Button className="mt-6" onClick={next}>Continuă</Button>
          </Card>
        )}

        {step === "media" && (
          <Card>
            <Field label="Media organizație" required hint="Poze sau videoclipuri relevante pentru profilul organizației.">
              <MediaEditor media={profile.media} setMedia={v => handleChange("media", v)} />
            </Field>
            <Button className="mt-6" onClick={next}>Continuă</Button>
          </Card>
        )}

        {step === "review" && (
          <Card>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-center mb-4">
                {profile.avatarUrl && (
                  <div className="h-32 w-32 rounded-full ring-4 ring-primary overflow-hidden bg-black/5 shadow-lg mb-2 flex items-center justify-center">
                    <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 md:ml-6">
                  <div className="text-2xl font-bold">{profile.name}</div>
                  <div className="text-primary font-semibold text-lg mt-1">{profile.headline}</div>
                  <div className="mt-2 text-gray-700">{profile.bio}</div>
                  <div className="flex gap-3 mt-2">
                    {profile.social.facebook && <a href={profile.social.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-primary">Facebook</a>}
                    {profile.social.instagram && <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-primary">Instagram</a>}
                    {profile.social.website && <a href={profile.social.website} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-primary">Website</a>}
                  </div>
                  <div className="text-gray-500 mt-2">{profile.location}</div>
                  <div className="mt-2">Voluntari: <span className="font-bold">{profile.volunteers}</span></div>
                </div>
              </div>
              <div>
                <b>Oportunități & Evenimente:</b>
                <ul className="list-disc pl-6">
                  {profile.events.map(ev => <li key={ev.id}>{ev.title} ({ev.date})</li>)}
                </ul>
              </div>
              <div>
                <b>Persoane cheie:</b>
                <ul className="list-disc pl-6">
                  {profile.keyPeople.map(pers => <li key={pers.id}>{pers.name} - {pers.role} {pers.responsibilities ? `(${pers.responsibilities})` : ""}</li>)}
                </ul>
              </div>
              <div>
                <b>Persoane contact:</b>
                <ul className="list-disc pl-6">
                  {profile.contactPersons.map(person => <li key={person.id}>{person.name} ({person.email}, {person.phone})</li>)}
                </ul>
              </div>
              <div>
                <b>Media:</b>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {profile.media.map(m =>
                    <div key={m.id} className="rounded-xl overflow-hidden ring-1 ring-black/10 bg-black/5">
                      {m.kind === 'image'
                        ? <img src={m.url} className="h-40 w-full object-cover" />
                        : <video src={m.url} className="h-40 w-full object-cover" controls />}
                      {m.caption && <div className="text-xs text-gray-600 text-center">{m.caption}</div>}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-2 items-center">
                <Button onClick={save} disabled={saving}>{saving ? "Se salvează…" : "Salvează profilul"}</Button>
                <Button className="ml-2" onClick={() => router.push("/organization/profile/preview")} type="button">
                  Previzualizează profilul
                </Button>
                <span className="px-2 py-1 rounded bg-black/5">XP: {xp}</span>
                <span className="px-2 py-1 rounded bg-black/5">{pct}%</span>
                <span className="hidden md:inline">ⓘ Ctrl/⌘+S salvează</span>
                {msg && <span className={cls("text-sm", msg === "Salvat!" ? "text-success" : "text-primary")}>{msg}</span>}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// Validation
function validateStep(step: StepKey, p: OrgProfilePayload) {
  switch (step) {
    case "basics": return !!p.name && !!p.headline && !!p.bio && !!p.avatarUrl && !!p.location && !!p.volunteers;
    case "events": return p.events.length > 0 && p.events.every(e => e.title && e.date);
    case "people": return p.keyPeople.length > 0 && p.keyPeople.every(x => x.name && x.role);
    case "contact": return p.contactPersons.length > 0 && p.contactPersons.every(c => c.name && c.email);
    case "media": return p.media.length > 0;
    case "review": return true;
  }
}
