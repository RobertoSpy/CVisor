"use client";
import { useRouter } from "next/navigation";

import React, { useEffect, useMemo, useRef, useState } from "react";


// ===================== Types =====================
type SocialLinks = { github?: string; linkedin?: string; website?: string };

type EducationItem = { id: string; school: string; degree: string; start: string; end?: string; details?: string };

type ExperienceItem = { id: string; role: string; company: string; start: string; end?: string; details?: string };

type Media = { id: string; kind: "image" | "video"; url: string; caption?: string };

type OppRef = { id: string; title: string; role?: string; org?: string; date?: string; tags?: string[]; cover?: string; media?: Media[]; rating?: number; testimonial?: string; certificateUrl?: string };

type ProfilePayload = { name: string; headline?: string; bio?: string; avatarDataUrl?: string; location?: string; skills: string[]; social: SocialLinks; education: EducationItem[]; experience: ExperienceItem[]; portfolioMedia: Media[]; opportunityRefs: OppRef[] };

// ===================== Utils =====================
const uid = () => Math.random().toString(36).slice(2, 9);
const cls = (...x: Array<string | false | undefined>) => x.filter(Boolean).join(" ");

// Progress helpers
function pctProfile(p: ProfilePayload){
  const checks = [!!p.name, !!p.headline, !!p.bio, p.skills.length>0, p.education.length>0, p.experience.length>0, p.opportunityRefs.length>0, p.portfolioMedia.length>0];
  return Math.round(checks.reduce((a,b)=>a+(b?1:0),0)/checks.length*100);
}
function xpOf(p: ProfilePayload){ return p.skills.length*10 + p.opportunityRefs.length*20 + p.portfolioMedia.length*5 + (p.education.length+p.experience.length)*8; }

// Debounce helper
function useDebouncedCallback<T extends any[]>(fn:(...args:T)=>void, delay=600){
  const t = useRef<NodeJS.Timeout | null>(null);
  return (...args: T) => { if (t.current) clearTimeout(t.current); t.current = setTimeout(()=> fn(...args), delay); };
}

// ===================== Minimal UI atoms =====================
function Button({children,className,onClick,disabled,type="button"}:{children:React.ReactNode;className?:string;onClick?:()=>void;disabled?:boolean;type?:"button"|"submit"}){
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls("px-4 py-2.5 rounded-xl text-sm shadow-sm transition inline-flex items-center justify-center", disabled?"bg-black/10 text-gray-500 cursor-not-allowed":"bg-primary text-white hover:bg-accent", className)}>{children}</button>
  );
}
function GhostButton({children,onClick}:{children:React.ReactNode;onClick?:()=>void}){
  return <button type="button" onClick={onClick} className="px-3 py-2 rounded-xl text-sm bg-black/5 hover:bg-black/10">{children}</button>;
}
function Field({label,children,required=false,hint,error}:{label:string;children:React.ReactNode;required?:boolean;hint?:string;error?:string}){
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
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} className={cls("w-full rounded-xl border border-black/10 bg-white/90 px-3.5 py-3 outline-none focus:ring-2 focus:ring-primary/30 transition placeholder:text-gray-400", props.className)} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return <textarea {...props} className={cls("w-full rounded-xl border border-black/10 bg-white/90 px-3.5 py-3 min-h-[120px] outline-none focus:ring-2 focus:ring-primary/30 transition placeholder:text-gray-400", props.className)} />;
}
function Pill({children}:{children:React.ReactNode}){return <span className="text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary">{children}</span>;}

function Card({children,className}:{children:React.ReactNode;className?:string}){
  return <div className={cls("bg-white/90 backdrop-blur rounded-2xl p-5 ring-1 ring-black/10 shadow-[0_6px_24px_rgba(0,0,0,0.06)]", className)}>{children}</div>;
}

function CheckRow({ok,label,sub}:{ok:boolean;label:string;sub?:string}){
  return (
    <div className="flex items-start gap-3">
      <div className={cls("mt-0.5 h-4 w-4 rounded-full grid place-items-center text-[10px]", ok?"bg-emerald-500 text-white":"bg-black/10 text-gray-500")}>{ok?"✓":"!"}</div>
      <div className="text-sm">
        <div className="font-medium">{label}</div>
        {sub && <div className="text-gray-500 text-xs">{sub}</div>}
      </div>
    </div>
  );
}

// ===================== Stepper =====================
const STEPS = [
  { key: "basics", label: "Date de bază" },
  { key: "skills", label: "Skill‑uri" },
  { key: "edu", label: "Educație" },
  { key: "exp", label: "Experiență" },
  { key: "opps", label: "Oportunități" },
  { key: "portfolio", label: "Portofoliu" },
  { key: "review", label: "Verificare & Salvare" },
] as const;

type StepKey = typeof STEPS[number]["key"];

function Stepper({current,completeMap,go}:{current:StepKey;completeMap:Record<StepKey,boolean>;go:(k:StepKey)=>void}){
  return (
    <nav className="sticky top-4 space-y-2">
      {STEPS.map((s,idx)=>{
        const done = completeMap[s.key];
        const isNow = current===s.key;
        return (
          <button key={s.key} onClick={()=>go(s.key)} className={cls(
            "w-full text-left px-3 py-3 rounded-xl ring-1",
            isNow?"bg-primary text-white ring-primary/60 shadow":"bg-white ring-black/10 hover:bg-black/5"
          )}>
            <div className="flex items-center gap-3">
              <div className={cls("h-6 w-6 rounded-full grid place-items-center text-xs", done?"bg-emerald-500 text-white":"bg-black/10 text-gray-600")}>{done?"✓":idx+1}</div>
              <div className="text-sm font-medium">{s.label}</div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

// ===================== Feature: Avatar =====================
function AvatarUploader({ value, onChange }:{ value?: string; onChange:(dataUrl?: string)=>void }){
  function handleFile(file: File){ const reader = new FileReader(); reader.onload = () => onChange(reader.result as string); reader.readAsDataURL(file); }
  return (
    <div className="flex items-center gap-4">
      <div className="h-24 w-24 rounded-full ring-1 ring-black/10 overflow-hidden bg-black/5">
        {value ? <img src={value} alt="avatar" className="h-full w-full object-cover"/> : <div className="h-full w-full grid place-items-center text-xs text-gray-500">Avatar</div>}
      </div>
      <label className="inline-flex items-center gap-2 bg-secondary text-white px-3.5 py-2.5 rounded-xl hover:bg-accent transition cursor-pointer shadow">Încarcă
        <input type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) handleFile(f); }} />
      </label>
      {value && <button type="button" onClick={()=>onChange(undefined)} className="text-sm underline underline-offset-4 decoration-primary hover:text-primary">Elimină</button>}
    </div>
  );
}

// ===================== Timeline =====================
function Timeline({ education, experience, opps }:{ education:EducationItem[]; experience:ExperienceItem[]; opps:OppRef[] }){
  type Entry = { id:string; kind:"edu"|"exp"|"opp"; title:string; org:string; start:string; end?:string; tags?:string[]; rating?:number };
  const items: Entry[] = [
    ...education.map(e=> ({ id:e.id, kind:"edu", title:e.degree, org:e.school, start:e.start, end:e.end })),
    ...experience.map(x=> ({ id:x.id, kind:"exp", title:x.role, org:x.company, start:x.start, end:x.end })),
    ...opps.map(o=> ({ id:o.id, kind:"opp", title:o.title, org:o.org||"", start:o.date||"", tags:o.tags, rating:o.rating }))
  ].sort((a,b)=> (a.start||"").localeCompare(b.start||""));

  const color = (k: Entry["kind"]) => k==="edu"?"from-blue-500/20 to-blue-500/5": k==="exp"?"from-emerald-500/20 to-emerald-500/5":"from-amber-500/20 to-amber-500/5";
  const label = (k: Entry["kind"]) => k==="edu"?"Educație": k==="exp"?"Experiență":"Oportunitate";

  if(!items.length) return <div className="text-sm text-gray-500">Completează datele pentru a vedea timeline‑ul.</div>;

  return (
    <ol className="relative pl-4">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-black/10"/>
      {items.map((it)=> (
        <li key={it.id} className="mb-6">
          <div className="absolute -left-1 mt-2 h-2 w-2 rounded-full bg-primary"/>
          <div className={cls("rounded-2xl p-5 ring-1 ring-black/10 bg-gradient-to-br", color(it.kind))}>
            <div className="text-xs text-gray-500 flex items-center gap-2"><Pill>{label(it.kind)}</Pill><span>{it.start}{it.end?` — ${it.end}`:""}</span></div>
            <div className="font-medium mt-1">{it.title}</div>
            <div className="text-sm text-gray-600">{it.org}</div>
            {it.tags && it.tags.length>0 && (<div className="flex flex-wrap gap-1 mt-2">{it.tags.map(t=> <Pill key={t}>{t}</Pill>)}</div>)}
          </div>
        </li>
      ))}
    </ol>
  );
}

// ===================== Editors =====================
function SkillsEditor({skills,setSkills}:{skills:string[];setSkills:(v:string[])=>void}){
  const [input,setInput] = useState("");
  const SUG = ["React","TypeScript","Java","SQL","Oracle","Spring","HTML","CSS","Node","Git","Docker","Teamwork"];
  function add(){ const parts = input.split(",").map(x=>x.trim()).filter(Boolean); if(!parts.length) return; setSkills(Array.from(new Set([...skills, ...parts]))); setInput(""); }
  function toggle(s:string){ setSkills(prev=> prev.includes(s)? prev.filter(x=>x!==s) : [...prev,s]); }
  return (
    <div className="space-y-4">
      <div className="flex gap-3 max-w-xl">
        <TextInput placeholder="Ex: React, TypeScript, Teamwork" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); add(); }}}/>
        <Button onClick={add}>Adaugă</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map(s=> (
          <span key={s} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary flex items-center gap-1">{s}<button className="opacity-60 hover:opacity-100" onClick={()=>setSkills(skills.filter(x=>x!==s))}>×</button></span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {SUG.map(s=> <button key={s} onClick={()=>toggle(s)} className={cls("text-xs px-2 py-1 rounded-full", skills.includes(s)?"bg-primary text-white":"bg-black/5 hover:bg-black/10")}>{s}</button>)}
      </div>
    </div>
  );
}

function EduEditor({items,setItems}:{items:EducationItem[];setItems:(v:EducationItem[])=>void}){
  function up(id:string,p:Partial<EducationItem>){ setItems(items.map(it=> it.id===id?{...it,...p}:it)); }
  function add(){ setItems([...items, {id:uid(), school:"", degree:"", start:"", end:""}]); }
  return (
    <div className="space-y-3">
      {items.map(it=> (
        <Card key={it.id}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Program / Diplomă" required><TextInput value={it.degree} onChange={e=>up(it.id,{degree:e.target.value})} placeholder="Licență Informatică"/></Field>
            <Field label="Instituție" required><TextInput value={it.school} onChange={e=>up(it.id,{school:e.target.value})} placeholder="FII – UAIC Iași"/></Field>
            <Field label="Start" required><TextInput type="month" value={it.start} onChange={e=>up(it.id,{start:e.target.value})}/></Field>
            <Field label="Sfârșit (opțional)"><TextInput type="month" value={it.end||""} onChange={e=>up(it.id,{end:e.target.value})}/></Field>
          </div>
        </Card>
      ))}
      <Button onClick={add}>+ Adaugă educație</Button>
    </div>
  );
}

function ExpEditor({items,setItems}:{items:ExperienceItem[];setItems:(v:ExperienceItem[])=>void}){
  function up(id:string,p:Partial<ExperienceItem>){ setItems(items.map(it=> it.id===id?{...it,...p}:it)); }
  function add(){ setItems([...items, {id:uid(), role:"", company:"", start:"", end:""}]); }
  return (
    <div className="space-y-3">
      {items.map(it=> (
        <Card key={it.id}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Rol" required><TextInput value={it.role} onChange={e=>up(it.id,{role:e.target.value})} placeholder="Frontend Intern"/></Field>
            <Field label="Organizație" required><TextInput value={it.company} onChange={e=>up(it.id,{company:e.target.value})} placeholder="Start-up local"/></Field>
            <Field label="Start" required><TextInput type="month" value={it.start} onChange={e=>up(it.id,{start:e.target.value})}/></Field>
            <Field label="Sfârșit (opțional)"><TextInput type="month" value={it.end||""} onChange={e=>up(it.id,{end:e.target.value})}/></Field>
          </div>
        </Card>
      ))}
      <Button onClick={add}>+ Adaugă experiență</Button>
    </div>
  );
}

function OppsEditor({items,setItems}:{items:OppRef[];setItems:(v:OppRef[])=>void}){
  function up(id:string,p:Partial<OppRef>){ setItems(items.map(it=> it.id===id?{...it,...p}:it)); }
  function add(){ setItems([...items,{id:uid(),title:"",role:"",org:"",date:"",tags:[],cover:"",media:[],rating:0,testimonial:""}]); }
  return (
    <div className="space-y-3">
      {items.map(o=> (
        <Card key={o.id}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Titlu" required><TextInput value={o.title} onChange={e=>up(o.id,{title:e.target.value})} placeholder="Hackathon – App Challenge"/></Field>
            <Field label="Rol" required><TextInput value={o.role||""} onChange={e=>up(o.id,{role:e.target.value})} placeholder="Participant / Frontend"/></Field>
            <Field label="Organizație"><TextInput value={o.org||""} onChange={e=>up(o.id,{org:e.target.value})} placeholder="Fundația X"/></Field>
            <Field label="Lună" required><TextInput type="month" value={o.date||""} onChange={e=>up(o.id,{date:e.target.value})}/></Field>
          </div>
          <div className="mt-3">
            <Field label="Taguri (Enter)" hint="ex: react, voluntariat">
              <TextInput onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); const v=(e.target as HTMLInputElement).value.trim(); if(v) up(o.id,{ tags:Array.from(new Set([...(o.tags||[]), v])) }); (e.target as HTMLInputElement).value=''; } }} />
            </Field>
            <div className="flex flex-wrap gap-2 mt-2">{(o.tags||[]).map(t=> <Pill key={t}>{t}</Pill>)}</div>
          </div>
        </Card>
      ))}
      <Button onClick={add}>+ Adaugă oportunitate</Button>
    </div>
  );
}

function MediaEditor({media,setMedia}:{media:Media[];setMedia:(v:Media[])=>void}){
  async function add(files: FileList | null){
  if(!files) return;
  const next: Media[] = [];
  for (const f of Array.from(files)) {
    // Upload către backend!
    const formData = new FormData();
    formData.append("file", f);

    // Endpoint pentru upload (vezi backend mai jos)
    const resp = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await resp.json();
    const url = data.url; // url public returnat de backend

    const isVideo = /video/.test(f.type) || /\.(mp4|webm|ogg)$/i.test(f.name);
    next.push({ id: uid(), kind: isVideo ? "video" : "image", url, caption: f.name });
  }
  setMedia([...media, ...next]);
}
  function remove(id:string){ setMedia(media.filter(m=>m.id!==id)); }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {media.map(m=> (
          <div key={m.id} className="relative rounded-xl overflow-hidden ring-1 ring-black/10 bg-black/5">
            {m.kind==='image'? <img src={m.url} className="h-40 w-full object-cover"/> : <video src={m.url} className="h-40 w-full object-cover" controls/>}
            <button onClick={()=>remove(m.id)} className="absolute top-2 right-2 text-xs bg-white/90 rounded px-2 py-1">Șterge</button>
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-2.5 rounded-xl hover:bg-accent transition cursor-pointer shadow">Adaugă media
        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e)=> add(e.target.files)} />
      </label>
    </div>
  );
}

// ===================== Validation & Missing =====================
function validateStep(step:StepKey, p:ProfilePayload){
  switch(step){
    case "basics": return !!p.name && !!p.headline && !!p.bio && !!p.location;
    case "skills": return p.skills.length>0;
    case "edu": return p.education.length>0 && p.education.every(e=> e.degree && e.school && e.start);
    case "exp": return p.experience.length>0 && p.experience.every(x=> x.role && x.company && x.start);
    case "opps": return p.opportunityRefs.length>0 && p.opportunityRefs.every(o=> o.title && o.role && o.date);
    case "portfolio": return p.portfolioMedia.length>0;
    case "review": return true;
  }
}

function missingList(p:ProfilePayload){
  const out:string[] = [];
  if(!p.name) out.push("Nume");
  if(!p.headline) out.push("Headline");
  if(!p.bio) out.push("Bio");
  if(!p.location) out.push("Locație");
  if(!p.skills.length) out.push("Minim 1 skill");
  if(!p.education.length) out.push("Cel puțin 1 educație");
  if(!p.experience.length) out.push("Cel puțin 1 experiență");
  if(!p.opportunityRefs.length) out.push("Cel puțin 1 oportunitate");
  if(!p.portfolioMedia.length) out.push("Cel puțin 1 media în portofoliu");
  return out;
}

// ===================== Main =====================
export default function StudentProfileWizard(){
const router = useRouter();
// Ia emailul curentului user 
const userEmail = localStorage.getItem("email") || "default";
const DRAFT_KEY = `profileWizardDraft_${userEmail}`;

  // State
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

  const [step, setStep] = useState<StepKey>("basics");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const payload: ProfilePayload = useMemo(()=>({ name, headline, bio, location, avatarDataUrl, skills, social, education, experience, portfolioMedia, opportunityRefs }), [name, headline, bio, location, avatarDataUrl, skills, social, education, experience, portfolioMedia, opportunityRefs]);

  // Autosave
  const debouncedStore = useDebouncedCallback((data:ProfilePayload)=>{ try{ localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); }catch{} }, 600);
  useEffect(()=>{ debouncedStore(payload); }, [payload]);
  useEffect(()=>{ try{ const raw=localStorage.getItem(DRAFT_KEY); if(raw){ const d=JSON.parse(raw) as ProfilePayload; setName(d.name||""); setHeadline(d.headline||""); setBio(d.bio||""); setLocation(d.location||""); setAvatarDataUrl(d.avatarDataUrl); setSkills(d.skills||[]); setSocial(d.social||{}); setEducation(d.education||[]); setExperience(d.experience||[]); setPortfolioMedia(d.portfolioMedia||[]); setOpportunityRefs(d.opportunityRefs||[]);} }catch{} },[]);

  // Completion map for stepper
  const completeMap = useMemo(()=>{
    const m: Record<StepKey, boolean> = { basics:false, skills:false, edu:false, exp:false, opps:false, portfolio:false, review:false };
    (Object.keys(m) as StepKey[]).forEach(k=> (m[k] = validateStep(k, payload)));
    return m;
  },[payload]);

  // Save
 async function save() {
  setSaving(true);
  setMsg(null);

 
  const token = localStorage.getItem("token");

  try {
    await fetch("/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }) 
      },
      body: JSON.stringify(payload)
    });
    setMsg("Salvat!");
  } catch {
    setMsg("Eroare la salvare");
  } finally {
    setSaving(false);
    setTimeout(() => setMsg(null), 2000);
  }
}

  const pct = pctProfile(payload);
  const xp = xpOf(payload);
  const miss = missingList(payload);

  function next(){ const idx = STEPS.findIndex(s=> s.key===step); const after = STEPS[idx+1]?.key; if(after) setStep(after); }
  function prev(){ const idx = STEPS.findIndex(s=> s.key===step); const before = STEPS[idx-1]?.key; if(before) setStep(before); }

  // Keyboard Ctrl/⌘+S
  useEffect(()=>{ const h=(e:KeyboardEvent)=>{ if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s'){ e.preventDefault(); save(); } }; window.addEventListener('keydown', h); return ()=> window.removeEventListener('keydown', h); }, [payload]);

  return (
    <div className="grid lg:grid-cols-[260px,1fr] gap-6 mt-10">
      {/* Left: Stepper + checklist */}
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-2"><div className="text-sm text-gray-600">Completitudine</div><div className="text-sm font-medium">{pct}%</div></div>
         <div className="h-2 bg-black/10 rounded-full overflow-hidden mb-2">
  <div
    className={
      "h-full transition-all duration-300 " +
      (pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-primary" : "bg-accent")
    }
    style={{ width: `${pct}%` }}
  />
</div>
          <div className="text-xs text-gray-600">XP: <span className="font-medium">{xp}</span></div>
        </Card>
        <Stepper current={step} completeMap={completeMap} go={setStep}/>
        <Card>
          <div className="text-sm font-medium mb-3">Checklist global (ca să nu ratezi nimic)</div>
          <div className="space-y-2">
            <CheckRow ok={!!name} label="Nume"/>
            <CheckRow ok={!!headline} label="Headline"/>
            <CheckRow ok={!!bio} label="Bio"/>
            <CheckRow ok={!!location} label="Locație"/>
            <CheckRow ok={skills.length>0} label="Minim 1 skill"/>
            <CheckRow ok={education.length>0} label="Cel puțin 1 educație"/>
            <CheckRow ok={experience.length>0} label="Cel puțin 1 experiență"/>
            <CheckRow ok={opportunityRefs.length>0} label="Cel puțin 1 oportunitate"/>
            <CheckRow ok={portfolioMedia.length>0} label="Cel puțin 1 media"/>
          </div>
        </Card>
      </div>

      {/* Right: Step content */}
      <div className="space-y-6">
        {step==="basics" && (
          <Card>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Field label="Nume" required><TextInput value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Andrei Popescu"/></Field>
                <Field label="Headline" required hint="Domeniu + focus"><TextInput value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="Student FII • Frontend"/></Field>
                <Field label="Locație" required><TextInput value={location} onChange={e=>setLocation(e.target.value)} placeholder="Iași, RO"/></Field>
                <Field label="Bio" required hint="2‑3 propoziții scurte"><Textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Îmi place să construiesc UI curate și să lucrez în echipă…"/></Field>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="GitHub"><TextInput value={social.github||""} onChange={e=>setSocial({...social, github:e.target.value})} placeholder="https://github.com/user"/></Field>
                  <Field label="LinkedIn"><TextInput value={social.linkedin||""} onChange={e=>setSocial({...social, linkedin:e.target.value})} placeholder="https://linkedin.com/in/user"/></Field>
                  <Field label="Website"><TextInput value={social.website||""} onChange={e=>setSocial({...social, website:e.target.value})} placeholder="https://site.dev"/></Field>
                </div>
              </div>
              <div className="space-y-4">
                <Field label="Avatar">
                  <AvatarUploader value={avatarDataUrl} onChange={setAvatarDataUrl}/>
                </Field>
                <Card>
                  <div className="text-sm font-medium mb-2">Ce trebuie să bifezi aici</div>
                  <ul className="text-sm text-gray-600 list-disc ml-4 space-y-1">
                    <li>Completează nume, headline, locație și bio</li>
                    <li>Opțional: adaugă linkuri sociale și un avatar</li>
                  </ul>
                </Card>
              </div>
            </div>
          </Card>
        )}

        {step==="skills" && (
          <Card>
            <Field label="Skill‑uri" required hint="Tastează și apasă Enter sau alege din sugestii">
              <SkillsEditor skills={skills} setSkills={setSkills}/>
            </Field>
          </Card>
        )}

        {step==="edu" && (
          <Card>
            <div className="flex items-center justify-between mb-3"><div className="text-sm text-gray-700">Adaugă cel puțin o intrare</div></div>
            <EduEditor items={education} setItems={setEducation}/>
          </Card>
        )}

        {step==="exp" && (
          <Card>
            <div className="text-sm text-gray-700 mb-3">Adaugă cel puțin o experiență</div>
            <ExpEditor items={experience} setItems={setExperience}/>
          </Card>
        )}

        {step==="opps" && (
          <Card>
            <div className="text-sm text-gray-700 mb-3">Adaugă minim o oportunitate (hackathon, voluntariat, proiect)</div>
            <OppsEditor items={opportunityRefs} setItems={setOpportunityRefs}/>
          </Card>
        )}

        {step==="portfolio" && (
          <Card>
            <div className="text-sm text-gray-700 mb-3">Încarcă cel puțin o poză sau un video</div>
            <MediaEditor media={portfolioMedia} setMedia={setPortfolioMedia}/>
          </Card>
        )}

        {step==="review" && (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <div className="text-lg font-semibold mb-2">Rezumat rapid</div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">Nume:</span> <span className="font-medium">{name||"—"}</span></div>
                  <div><span className="text-gray-500">Headline:</span> <span className="font-medium">{headline||"—"}</span></div>
                  <div><span className="text-gray-500">Locație:</span> <span className="font-medium">{location||"—"}</span></div>
                  <div className="flex items-start gap-2 flex-wrap"><span className="text-gray-500">Skill‑uri:</span> {skills.length? skills.map(s=> <Pill key={s}>{s}</Pill>) : "—"}</div>
                  <div><span className="text-gray-500">Educație:</span> <span className="font-medium">{education.length}</span></div>
                  <div><span className="text-gray-500">Experiențe:</span> <span className="font-medium">{experience.length}</span></div>
                  <div><span className="text-gray-500">Oportunități:</span> <span className="font-medium">{opportunityRefs.length}</span></div>
                  <div><span className="text-gray-500">Media:</span> <span className="font-medium">{portfolioMedia.length}</span></div>
                </div>
              </Card>
              <Card>
                <div className="text-lg font-semibold mb-2">Ce mai lipsește</div>
                {miss.length? (
                  <ul className="list-disc ml-4 text-sm text-gray-700 space-y-1">
                    {miss.map(m => <li key={m}>{m}</li>)}
                  </ul>
                ) : <div className="text-sm text-emerald-700">Totul este complet ✔</div>}
              </Card>
            </div>
            <Card>
              <div className="text-lg font-semibold mb-3">Timeline</div>
              <Timeline education={education} experience={experience} opps={opportunityRefs}/>
            </Card>
          </>
        )}

        {/* Footer actions */}
        <div className="sticky bottom-4">
          <div className="bg-white/95 backdrop-blur ring-1 ring-black/10 rounded-2xl p-3 flex flex-wrap items-center gap-3 shadow">
            <GhostButton onClick={prev}>Înapoi</GhostButton>
            {step!=="review" && (
              <Button onClick={next} disabled={!validateStep(step, payload)}>Continuă</Button>
            )}
            {step === "review" && (
      <>
        <Button onClick={save} disabled={miss.length > 0 || saving}>
          {saving ? "Se salvează…" : "Salvează profilul"}
        </Button>
        <Button
          className="ml-2"
          onClick={() => router.push("/student/profile/preview")}
          type="button"
        >
          Previzualizează profilul
        </Button>
      </>
    )}
            <div className="ml-auto text-sm text-gray-600 flex items-center gap-2"><span className="px-2 py-1 rounded bg-black/5">XP: {xp}</span><span className="px-2 py-1 rounded bg-black/5">{pct}%</span><span className="hidden md:inline">ⓘ Ctrl/⌘+S salvează</span></div>
            {msg && <span className={cls("text-sm", msg==="Salvat!"?"text-success":"text-primary")}>{msg}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}