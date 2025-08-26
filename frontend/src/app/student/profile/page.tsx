"use client";
import { useMemo, useState } from "react";

// ==== Tipuri de date (bun și pentru backend) ====
type SocialLinks = {
  github?: string;
  linkedin?: string;
  website?: string;
};

type EducationItem = {
  id: string;
  school: string;
  degree: string;
  start: string; // YYYY-MM
  end?: string;  // YYYY-MM sau gol = prezent
  details?: string;
};

type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  start: string; // YYYY-MM
  end?: string;
  details?: string;
};

type ProfilePayload = {
  name: string;
  headline?: string;  // ex: "Student Informatica • Frontend"
  bio?: string;
  avatarDataUrl?: string; // pentru demo (în prod: URL de la storage)
  skills: string[];
  social: SocialLinks;
  education: EducationItem[];
  experience: ExperienceItem[];
};

// ==== Utilitare ====
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ==== Componente mici reutilizabile ====
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 " +
        (props.className || "")
      }
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 min-h-[110px] " +
        (props.className || "")
      }
    />
  );
}

// ==== Avatar uploader (preview local) ====
function AvatarUploader({
  value,
  onChange,
}: {
  value?: string;
  onChange: (dataUrl?: string) => void;
}) {
  async function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }
  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 rounded-full ring-1 ring-black/10 overflow-hidden bg-black/5">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
            Avatar
          </div>
        )}
      </div>
      <label className="inline-flex items-center gap-2 bg-secondary text-white px-3 py-2 rounded-lg hover:bg-accent transition cursor-pointer shadow">
        Încarcă
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </label>
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-sm underline underline-offset-4 decoration-primary hover:text-primary"
        >
          Elimină
        </button>
      )}
    </div>
  );
}

// ==== Chip input pentru skill-uri ====
function SkillChips({
  skills,
  setSkills,
}: {
  skills: string[];
  setSkills: (s: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addFromInput() {
    const parts = input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setSkills(Array.from(new Set([...skills, ...parts])));
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addFromInput();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {skills.map((s) => (
          <span
            key={s}
            className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary flex items-center gap-1"
          >
            {s}
            <button
              type="button"
              className="ml-1 opacity-60 hover:opacity-100"
              onClick={() => setSkills(skills.filter((x) => x !== s))}
              aria-label={`Elimină ${s}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <TextInput
          placeholder="Ex: React, TypeScript, Teamwork"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          onClick={addFromInput}
          className="px-3 py-2 rounded-lg bg-secondary text-white hover:bg-accent transition shadow"
        >
          Adaugă
        </button>
      </div>
    </div>
  );
}

// ==== Liste dinamice: Educație / Experiență ====
function EducationList({
  items,
  setItems,
}: {
  items: EducationItem[];
  setItems: (v: EducationItem[]) => void;
}) {
  function update(id: string, patch: Partial<EducationItem>) {
    setItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function remove(id: string) {
    setItems(items.filter((it) => it.id !== id));
  }
  function add() {
    setItems([
      ...items,
      { id: uid(), school: "", degree: "", start: "", end: "", details: "" },
    ]);
  }
  return (
    <div className="space-y-4">
      {items.map((it) => (
        <div
          key={it.id}
          className="rounded-xl p-4 bg-white/70 border border-black/10"
        >
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Instituție">
              <TextInput
                value={it.school}
                onChange={(e) => update(it.id, { school: e.target.value })}
                placeholder="Ex: Universitatea X"
              />
            </Field>
            <Field label="Program / Diplomă">
              <TextInput
                value={it.degree}
                onChange={(e) => update(it.id, { degree: e.target.value })}
                placeholder="Ex: Licență Informatică"
              />
            </Field>
            <Field label="Început">
              <TextInput
                type="month"
                value={it.start}
                onChange={(e) => update(it.id, { start: e.target.value })}
              />
            </Field>
            <Field label="Sfârșit (opțional)">
              <TextInput
                type="month"
                value={it.end || ""}
                onChange={(e) => update(it.id, { end: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Detalii (opțional)">
            <Textarea
              value={it.details || ""}
              onChange={(e) => update(it.id, { details: e.target.value })}
              placeholder="Cursuri relevante, proiecte, distincții…"
            />
          </Field>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => remove(it.id)}
              className="text-sm text-accent hover:underline"
            >
              Șterge
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="px-3 py-2 rounded-lg bg-primary text-white hover:bg-accent transition shadow"
      >
        + Adaugă educație
      </button>
    </div>
  );
}

function ExperienceList({
  items,
  setItems,
}: {
  items: ExperienceItem[];
  setItems: (v: ExperienceItem[]) => void;
}) {
  function update(id: string, patch: Partial<ExperienceItem>) {
    setItems(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function remove(id: string) {
    setItems(items.filter((it) => it.id !== id));
  }
  function add() {
    setItems([
      ...items,
      { id: uid(), role: "", company: "", start: "", end: "", details: "" },
    ]);
  }
  return (
    <div className="space-y-4">
      {items.map((it) => (
        <div
          key={it.id}
          className="rounded-xl p-4 bg-white/70 border border-black/10"
        >
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Rol">
              <TextInput
                value={it.role}
                onChange={(e) => update(it.id, { role: e.target.value })}
                placeholder="Ex: Voluntar Frontend"
              />
            </Field>
            <Field label="Organizație">
              <TextInput
                value={it.company}
                onChange={(e) => update(it.id, { company: e.target.value })}
                placeholder="Ex: Asociația ABC"
              />
            </Field>
            <Field label="Început">
              <TextInput
                type="month"
                value={it.start}
                onChange={(e) => update(it.id, { start: e.target.value })}
              />
            </Field>
            <Field label="Sfârșit (opțional)">
              <TextInput
                type="month"
                value={it.end || ""}
                onChange={(e) => update(it.id, { end: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Detalii (responsabilități, impact)">
            <Textarea
              value={it.details || ""}
              onChange={(e) => update(it.id, { details: e.target.value })}
              placeholder="Ex: Am dezvoltat componenta X, am coordonat 5 voluntari, am crescut NPS cu 15%..."
            />
          </Field>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => remove(it.id)}
              className="text-sm text-accent hover:underline"
            >
              Șterge
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="px-3 py-2 rounded-lg bg-primary text-white hover:bg-accent transition shadow"
      >
        + Adaugă experiență
      </button>
    </div>
  );
}

// ==== Pagina principală ====
export default function ProfilePage() {
  // State inițial (poți popula din backend cu useEffect)
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState(""); // subtitlu: "Frontend • Student an III"
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [social, setSocial] = useState<SocialLinks>({});
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const payload: ProfilePayload = useMemo(
    () => ({
      name,
      headline,
      bio,
      avatarDataUrl,
      skills,
      social,
      education,
      experience,
    }),
    [name, headline, bio, avatarDataUrl, skills, social, education, experience]
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      // TODO: schimbă URL-ul după backendul tău; ideal trimiți doar link-ul avatarului,
      // nu dataURL (upload pe S3/Cloudinary și salvezi URL)
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"}/api/users/me`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setMsg("Salvat!");
    } catch {
      setMsg("Eroare la salvare");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 mt-10">
      {/* Card identitate */}
      <div className="bg-card rounded-2xl p-6 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Identitate</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <AvatarUploader value={avatarDataUrl} onChange={setAvatarDataUrl} />
          </div>
          <div className="md:col-span-2 space-y-4">
            <Field label="Nume">
              <TextInput
                placeholder="Ex: Andrei Popescu"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Headline (scurt)">
              <TextInput
                placeholder="Ex: Student Informatică • Frontend React"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </Field>
            <Field label="Bio (scurtă prezentare)">
              <Textarea
                placeholder="Câteva propoziții despre tine, interese și ce cauți."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Card skill-uri */}
      <div className="bg-card rounded-2xl p-6 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Skill-uri</h2>
        <SkillChips skills={skills} setSkills={setSkills} />
      </div>

      {/* Card social links */}
      <div className="bg-card rounded-2xl p-6 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Linkuri</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="GitHub">
            <TextInput
              placeholder="https://github.com/username"
              value={social.github || ""}
              onChange={(e) => setSocial({ ...social, github: e.target.value })}
            />
          </Field>
          <Field label="LinkedIn">
            <TextInput
              placeholder="https://www.linkedin.com/in/username"
              value={social.linkedin || ""}
              onChange={(e) =>
                setSocial({ ...social, linkedin: e.target.value })
              }
            />
          </Field>
          <Field label="Website">
            <TextInput
              placeholder="https://site-ul-meu.dev"
              value={social.website || ""}
              onChange={(e) =>
                setSocial({ ...social, website: e.target.value })
              }
            />
          </Field>
        </div>
      </div>

      {/* Card educație */}
      <div className="bg-card rounded-2xl p-6 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Educație</h2>
        <EducationList items={education} setItems={setEducation} />
      </div>

      {/* Card experiență */}
      <div className="bg-card rounded-2xl p-6 ring-1 ring-black/5 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Experiență</h2>
        <ExperienceList items={experience} setItems={setExperience} />
      </div>

      {/* Acțiuni */}
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-accent transition shadow disabled:opacity-60"
        >
          {saving ? "Se salvează…" : "Salvează profilul"}
        </button>
        <a
          href="/student/cv/preview"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-accent transition shadow"
          title="Previzualizează CV-ul compus din datele de mai sus"
        >
          Previzualizează CV →
        </a>
        {msg && (
          <span
            className={`text-sm ${
              msg === "Salvat!" ? "text-success" : "text-accent"
            }`}
          >
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}
