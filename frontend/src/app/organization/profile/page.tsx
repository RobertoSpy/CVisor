"use client";
import React, { useState, useMemo, useEffect } from "react";

// ===================== Types =====================
type KeyPerson = { id: string; name: string; role: string; responsibilities: string };
type EventItem = { id: string; year: string; title: string };
type SocialPlatform = { id: string; name: string; url: string };
type SocialLinks = SocialPlatform[];
type ContactPerson = { id: string; name: string; email: string; phone: string };

type OrgProfilePayload = {
  name: string;
  history: string;
  events: EventItem[];
  keyPeople: KeyPerson[];
  location: string;
  contactPersons: ContactPerson[];
  social: SocialLinks;
};

const uid = () => Math.random().toString(36).slice(2, 9);
const STEPS = [
  { key: "basics", label: "Date de bază" },
  { key: "history", label: "Istoric" },
  { key: "events", label: "Evenimente" },
  { key: "people", label: "Persoane cheie" },
  { key: "location", label: "Locație" },
  { key: "contact", label: "Contact" },
  { key: "social", label: "Social" },
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
          <button key={s.key} onClick={() => go(s.key)} className={`w-full text-left px-3 py-3 rounded-xl ring-1 ${isNow ? "bg-primary text-white ring-primary/60 shadow" : "bg-white ring-black/10 hover:bg-black/5"}`}>
            <div className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded-full grid place-items-center text-xs ${done ? "bg-emerald-500 text-white" : "bg-black/10 text-gray-600"}`}>{done ? "✓" : idx + 1}</div>
              <div className="text-sm font-medium">{s.label}</div>
            </div>
          </button>
        );
      })}
    </nav>
  );
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
  return <input {...props} className={`w-full rounded-xl border border-black/10 bg-white/90 px-3.5 py-3 outline-none focus:ring-2 focus:ring-primary/30 transition placeholder:text-gray-400 ${props.className ?? ""}`} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-xl border border-black/10 bg-white/90 px-3.5 py-3 min-h-[120px] outline-none focus:ring-2 focus:ring-primary/30 transition placeholder:text-gray-400 ${props.className ?? ""}`} />;
}
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white/90 backdrop-blur rounded-2xl p-5 ring-1 ring-black/10 shadow-[0_6px_24px_rgba(0,0,0,0.06)] ${className ?? ""}`}>{children}</div>;
}

function validateStep(step: StepKey, p: OrgProfilePayload) {
  switch (step) {
    case "basics": return !!p.name;
    case "history": return !!p.history;
    case "events": return p.events.length > 0 && p.events.every(e => e.year && e.title);
    case "people": return p.keyPeople.length > 0 && p.keyPeople.every(x => x.name && x.role);
    case "location": return !!p.location;
    case "contact": return p.contactPersons.length > 0 && p.contactPersons.every(c => c.name && c.email);
    case "social": return p.social.length > 0 && p.social.every(s => s.name && s.url);
    case "review": return true;
  }
}

export default function OrganizationProfileWizard() {
  // State
  const [step, setStep] = useState<StepKey>("basics");
  const [profile, setProfile] = useState<OrgProfilePayload>({
    name: "",
    history: "",
    events: [],
    keyPeople: [],
    location: "",
    contactPersons: [{ id: uid(), name: "", email: "", phone: "" }],
    social: [],
  });
  const [msg, setMsg] = useState<string | null>(null);

  // Completion map for stepper
  const completeMap = useMemo(() => {
    const m: Record<StepKey, boolean> = { basics: false, history: false, events: false, people: false, location: false, contact: false, social: false, review: false };
    (Object.keys(m) as StepKey[]).forEach(k => (m[k] = validateStep(k, profile)));
    return m;
  }, [profile]);

  // Autosave local
  useEffect(() => { try { localStorage.setItem("orgProfileDraft", JSON.stringify(profile)); } catch { } }, [profile]);
  useEffect(() => { try { const raw = localStorage.getItem("orgProfileDraft"); if (raw) setProfile(JSON.parse(raw)); } catch { } }, []);

  function handleChange<K extends keyof OrgProfilePayload>(key: K, value: OrgProfilePayload[K]) {
    setProfile(prev => ({ ...prev, [key]: value }));
  }

  function save() {
    setMsg("Salvat local!");
    setTimeout(() => setMsg(null), 2000);
  }


  // Step navigation
  function nextStep() {
    const idx = STEPS.findIndex(s => s.key === step);
    const after = STEPS[idx + 1]?.key;
    if (after) setStep(after);
  }
  // Step content
  return (
    <div className="grid lg:grid-cols-[260px,1fr] gap-6 mt-10">
      {/* Left: Stepper */}
      <div className="space-y-4">
        <Stepper current={step} completeMap={completeMap} go={setStep} />
        <Card>
          <div className="text-sm font-medium mb-3">Checklist global</div>
          <div className="space-y-2">
            <div className="text-sm">Nume: <span className={profile.name ? "text-emerald-600" : "text-accent"}>{profile.name ? "✔" : "✗"}</span></div>
            <div className="text-sm">Istoric: <span className={profile.history ? "text-emerald-600" : "text-accent"}>{profile.history ? "✔" : "✗"}</span></div>
            <div className="text-sm">Evenimente: <span className={profile.events.length ? "text-emerald-600" : "text-accent"}>{profile.events.length ? "✔" : "✗"}</span></div>
            <div className="text-sm">Persoane cheie: <span className={profile.keyPeople.length ? "text-emerald-600" : "text-accent"}>{profile.keyPeople.length ? "✔" : "✗"}</span></div>
            <div className="text-sm">Locație: <span className={profile.location ? "text-emerald-600" : "text-accent"}>{profile.location ? "✔" : "✗"}</span></div>
            <div className="text-sm">Contact: <span className={profile.contactPersons.length > 0 && profile.contactPersons.every(c => c.name && c.email) ? "text-emerald-600" : "text-accent"}>{profile.contactPersons.length > 0 && profile.contactPersons.every(c => c.name && c.email) ? "✔" : "✗"}</span></div>
            <div className="text-sm">Social: <span className={profile.social.length > 0 && profile.social.every(s => s.name && s.url) ? "text-emerald-600" : "text-accent"}>{profile.social.length > 0 && profile.social.every(s => s.name && s.url) ? "✔" : "✗"}</span></div>
          </div>
        </Card>
      </div>

      {/* Right: Step content */}
      <div className="space-y-6">
        {step === "basics" && (
          <Card>
            <Field label="Nume organizație" required>
              <TextInput value={profile.name} onChange={e => handleChange("name", e.target.value)} placeholder="Ex: Compania Exemplu SRL" />
            </Field>
            <button type="button" className="mt-6 px-4 py-2 rounded bg-primary text-white" onClick={nextStep}>Continuă</button>
          </Card>
        )}
        {step === "history" && (
          <Card>
            <Field label="Istoric organizație" required>
              <Textarea value={profile.history} onChange={e => handleChange("history", e.target.value)} placeholder="Scurt istoric, misiune, valori..." />
            </Field>
            <button type="button" className="mt-6 px-4 py-2 rounded bg-primary text-white" onClick={nextStep}>Continuă</button>
          </Card>
        )}
        {step === "events" && (
          <Card>
            <div className="space-y-3">
              {profile.events.map(ev => (
                <div key={ev.id} className="grid grid-cols-2 gap-3">
                  <TextInput value={ev.year} onChange={e => handleChange("events", profile.events.map(x => x.id === ev.id ? { ...x, year: e.target.value } : x))} placeholder="Anul" />
                  <TextInput value={ev.title} onChange={e => handleChange("events", profile.events.map(x => x.id === ev.id ? { ...x, title: e.target.value } : x))} placeholder="Titlu eveniment" />
                </div>
              ))}
              <button type="button" className="px-4 py-2 rounded bg-primary text-white" onClick={() => handleChange("events", [...profile.events, { id: uid(), year: "", title: "" }])}>+ Adaugă eveniment</button>
            </div>
            <button type="button" className="mt-6 px-4 py-2 rounded bg-primary text-white" onClick={nextStep}>Continuă</button>
          </Card>
        )}
        {step === "people" && (
          <Card>
            <div className="space-y-3">
              {(profile.keyPeople.length === 0 ? [{ id: uid(), name: "", role: "", responsibilities: "" }] : profile.keyPeople).map((pers, idx) => (
                <div key={pers.id} className="grid grid-cols-3 gap-3 items-center">
                  <TextInput value={pers.name} onChange={e => handleChange("keyPeople", profile.keyPeople.map(x => x.id === pers.id ? { ...x, name: e.target.value } : x))} placeholder="Nume" />
                  <TextInput value={pers.role} onChange={e => handleChange("keyPeople", profile.keyPeople.map(x => x.id === pers.id ? { ...x, role: e.target.value } : x))} placeholder="Rol" />
                  <TextInput value={pers.responsibilities} onChange={e => handleChange("keyPeople", profile.keyPeople.map(x => x.id === pers.id ? { ...x, responsibilities: e.target.value } : x))} placeholder="Responsabilități" />
                  {profile.keyPeople.length > 1 && (
                    <button type="button" className="px-3 py-2 rounded bg-red-500 text-white" onClick={() => handleChange("keyPeople", profile.keyPeople.filter(x => x.id !== pers.id))}>Șterge</button>
                  )}
                </div>
              ))}
              <button type="button" className="px-4 py-2 rounded bg-primary text-white" onClick={() => handleChange("keyPeople", [...profile.keyPeople, { id: uid(), name: "", role: "", responsibilities: "" }])}>+ Adaugă persoană</button>
            </div>
            <button type="button" className="mt-6 px-4 py-2 rounded bg-primary text-white" onClick={nextStep}>Continuă</button>
          </Card>
        )}
        {step === "location" && (
          <Card>
            <Field label="Locație firmă" required>
              <TextInput value={profile.location} onChange={e => handleChange("location", e.target.value)} placeholder="Str. Exemplului 12, București, România" />
            </Field>
            <button type="button" className="mt-6 px-4 py-2 rounded bg-primary text-white" onClick={nextStep}>Continuă</button>
          </Card>
        )}
        {step === "contact" && (
          <Card>
            <div className="space-y-3">
              {(profile.contactPersons.length === 0 ? [{ id: uid(), name: "", email: "", phone: "" }] : profile.contactPersons).map((person, idx) => (
                <div key={person.id} className="grid grid-cols-3 gap-3 items-center">
                  <TextInput value={person.name} onChange={e => handleChange("contactPersons", profile.contactPersons.map(x => x.id === person.id ? { ...x, name: e.target.value } : x))} placeholder="Nume" />
                  <TextInput value={person.email} onChange={e => handleChange("contactPersons", profile.contactPersons.map(x => x.id === person.id ? { ...x, email: e.target.value } : x))} placeholder="Email" />
                  <TextInput value={person.phone} onChange={e => handleChange("contactPersons", profile.contactPersons.map(x => x.id === person.id ? { ...x, phone: e.target.value } : x))} placeholder="Telefon" />
                  {profile.contactPersons.length > 1 && (
                    <button type="button" className="px-3 py-2 rounded bg-red-500 text-white" onClick={() => handleChange("contactPersons", profile.contactPersons.filter(x => x.id !== person.id))}>Șterge</button>
                  )}
                </div>
              ))}
              <button type="button" className="px-4 py-2 rounded bg-primary text-white" onClick={() => handleChange("contactPersons", [...profile.contactPersons, { id: uid(), name: "", email: "", phone: "" }])}>+ Adaugă persoană contact</button>
            </div>
            <button type="button" className="mt-6 px-4 py-2 rounded bg-primary text-white" onClick={nextStep}>Continuă</button>
          </Card>
        )}
        {step === "social" && (
          <Card>
            <div className="space-y-3">
              {(profile.social.length === 0 ? [{ id: uid(), name: "", url: "" }] : profile.social).map((platform, idx) => (
                <div key={platform.id} className="grid grid-cols-3 gap-3 items-center">
                  <TextInput value={platform.name} onChange={e => handleChange("social", profile.social.map(x => x.id === platform.id ? { ...x, name: e.target.value } : x))} placeholder="Nume platformă (ex: Facebook, Instagram, TikTok)" />
                  <TextInput value={platform.url} onChange={e => handleChange("social", profile.social.map(x => x.id === platform.id ? { ...x, url: e.target.value } : x))} placeholder="Link profil" />
                  {profile.social.length > 1 && (
                    <button type="button" className="px-3 py-2 rounded bg-red-500 text-white" onClick={() => handleChange("social", profile.social.filter(x => x.id !== platform.id))}>Șterge</button>
                  )}
                </div>
              ))}
              <button type="button" className="px-4 py-2 rounded bg-primary text-white" onClick={() => handleChange("social", [...profile.social, { id: uid(), name: "", url: "" }])}>+ Adaugă platformă</button>
            </div>
            <button type="button" className="mt-6 px-4 py-2 rounded bg-primary text-white" onClick={nextStep}>Continuă</button>
          </Card>
        )}
        {step === "review" && (
          <Card>
            <div className="space-y-4">
              <div className="text-lg font-bold">Rezumat profil organizație</div>
              <div><b>Nume:</b> {profile.name}</div>
              <div><b>Istoric:</b> {profile.history}</div>
              <div><b>Locație:</b> {profile.location}</div>
              <div><b>Persoane contact:</b> <ul className="list-disc pl-6">{profile.contactPersons.map(person => <li key={person.id}>{person.name} ({person.email}, {person.phone})</li>)}</ul></div>
              <div><b>Evenimente:</b> <ul className="list-disc pl-6">{profile.events.map(ev => <li key={ev.id}>{ev.year}: {ev.title}</li>)}</ul></div>
              <div><b>Persoane cheie:</b> <ul className="list-disc pl-6">{profile.keyPeople.map(pers => <li key={pers.id}>{pers.name} - {pers.role} ({pers.responsibilities})</li>)}</ul></div>
              <div><b>Social:</b> <ul className="list-disc pl-6">
                {profile.social.map((platform) => (
                  <li key={platform.id}>{platform.name}: {platform.url}</li>
                ))}
              </ul></div>
              <button type="button" className="px-4 py-2 rounded bg-primary text-white" onClick={save}>Salvează profilul</button>
              {msg && <div className="text-green-600 font-medium mt-2">{msg}</div>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
