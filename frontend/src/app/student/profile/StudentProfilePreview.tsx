"use client";
import React from "react";

type SocialLinks = { github?: string; linkedin?: string; website?: string };
type EducationItem = { id?: string; school: string; degree: string; start: string; end?: string; details?: string };
type ExperienceItem = { id?: string; role: string; company: string; start: string; end?: string; details?: string };
type Media = { id?: string; kind: "image" | "video"; url: string; caption?: string };
type OppRef = { id?: string; title: string; role?: string; org?: string; date?: string; tags?: string[]; cover?: string; media?: Media[]; rating?: number; testimonial?: string; certificateUrl?: string };

type ProfilePayload = {
  name: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  skills: string[];
  social: SocialLinks;
  education: EducationItem[];
  experience: ExperienceItem[];
  portfolioMedia: Media[];
  opportunityRefs: OppRef[];
};

export default function StudentProfilePreview({ profile }: { profile: ProfilePayload }) {
  if (!profile) return <div className="py-10 text-center text-red-500 font-semibold text-lg">Nu s-au găsit date de profil.</div>;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Card profil */}
      <div className="flex flex-col md:flex-row items-center bg-white/90 rounded-3xl shadow-lg ring-1 ring-black/10 p-8 mb-8">
        <div className="h-32 w-32 rounded-full overflow-hidden ring-2 ring-primary bg-black/5 flex-shrink-0">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-lg text-gray-400">Avatar</div>
          )}
        </div>
        <div className="flex-1 mt-6 md:mt-0 md:ml-8">
          <div className="text-2xl font-bold text-gray-900">{profile.name}</div>
          <div className="text-primary font-semibold text-lg mt-1">{profile.headline}</div>
          {profile.location && <div className="text-gray-500 mt-1 flex items-center gap-2"><span className="material-icons">location_on</span>{profile.location}</div>}
          <div className="mt-3 text-gray-700">{profile.bio}</div>
          <div className="mt-4 flex gap-4">
            {profile.social.github && (
              <a href={profile.social.github} target="_blank" rel="noopener noreferrer"
                 className="text-gray-800 hover:text-primary flex items-center gap-1">
                <span className="material-icons">code</span> GitHub
              </a>
            )}
            {profile.social.linkedin && (
              <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer"
                 className="text-blue-700 hover:text-primary flex items-center gap-1">
                <span className="material-icons">business_center</span> LinkedIn
              </a>
            )}
            {profile.social.website && (
              <a href={profile.social.website} target="_blank" rel="noopener noreferrer"
                 className="text-gray-700 hover:text-primary flex items-center gap-1">
                <span className="material-icons">public</span> Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-8">
        <div className="font-semibold text-gray-800 mb-2">Skill‑uri</div>
        <div className="flex flex-wrap gap-2">
          {profile.skills.length ? profile.skills.map(s =>
            <span key={s} className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-medium text-sm">{s}</span>
          ) : <span className="text-gray-400">—</span>}
        </div>
      </div>

      {/* Timeline Edu + Exp + Opps */}
      <div className="mb-8">
        <div className="font-semibold text-gray-800 mb-4">Parcurs educațional & experiență</div>
        <ol className="relative pl-4">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-black/10"/>
          {[...profile.education, ...profile.experience, ...(profile.opportunityRefs || [])].sort((a, b) =>
            (a.start || a.date || "").localeCompare(b.start || b.date || "")
          ).map((item, idx) => (
           <li key={`${item.degree ? "edu" : item.role ? "exp" : "opp"}_${item.id ?? idx}`} className="mb-7">
              <div className="absolute -left-1 mt-2 h-2 w-2 rounded-full bg-primary"/>
              <div className="rounded-2xl p-5 ring-1 ring-black/10 bg-gradient-to-br from-gray-100 to-white">
                <div className="text-xs text-gray-500 mb-1">
                  {item.degree ? "Educație" : item.role ? "Experiență" : "Oportunitate"}
                  <span className="ml-2 text-primary">{item.start || item.date}</span>
                  {item.end && <span className="ml-1 text-gray-400">– {item.end}</span>}
                </div>
                <div className="font-medium text-lg">{item.degree || item.role || item.title}</div>
                <div className="text-gray-700">{item.school || item.company || item.org}</div>
                {item.details && <div className="mt-2 text-gray-500 text-sm">{item.details}</div>}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">{item.tags.map(t => <span key={t} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">{t}</span>)}</div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Portofoliu Media */}
      <div className="mb-8">
        <div className="font-semibold text-gray-800 mb-2">Portofoliu media</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.portfolioMedia.length ? profile.portfolioMedia.map(m => (
            <div key={m.id || m.url} className="rounded-xl overflow-hidden ring-1 ring-black/10 bg-black/5 flex flex-col items-center justify-center p-4">
              {m.kind === "image" ? (
                <img
                  src={m.url}
                  alt={m.caption || "media"}
                  className="max-w-xl w-full h-auto object-contain mx-auto"
                  style={{ maxHeight: "400px", borderRadius: "1rem" }}
                />
              ) : (
                <div className="w-full flex items-center justify-center">
                  <div className="aspect-video max-w-xl w-full mx-auto bg-black rounded-xl overflow-hidden flex items-center justify-center">
                    <video
                      controls
                      src={m.url}
                      className="w-full h-full object-contain"
                      style={{ maxHeight: "400px", maxWidth: "100%" }}
                    >
                      Video portofoliu
                    </video>
                  </div>
                </div>
              )}
              {m.caption && (
                <div className="p-2 text-xs text-gray-600 text-center">{m.caption}</div>
              )}
            </div>
          )) : (
            <span className="text-gray-400">Nu ai media încărcată.</span>
          )}
        </div>
      </div>

      {/* Oportunități (detaliat - dacă vrei separat) */}
      {profile.opportunityRefs && profile.opportunityRefs.length > 0 && (
        <div className="mb-8">
          <div className="font-semibold text-gray-800 mb-2">Oportunități</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.opportunityRefs.map(o => (
              <div key={o.id || o.title} className="rounded-xl ring-1 ring-black/10 p-4 bg-white">
                <div className="font-semibold">{o.title}</div>
                {o.role && <div className="text-sm text-gray-500">{o.role}</div>}
                {o.org && <div className="text-sm text-gray-500">{o.org}</div>}
                {o.date && <div className="text-sm text-gray-400">{o.date}</div>}
                {o.tags && o.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">{o.tags.map(t => <span key={t} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">{t}</span>)}</div>
                )}
                {o.testimonial && <div className="mt-2 text-gray-700 italic">„{o.testimonial}”</div>}
                {o.certificateUrl && (
                  <a href={o.certificateUrl} target="_blank" className="mt-2 text-primary underline text-xs block">Vezi certificatul</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}