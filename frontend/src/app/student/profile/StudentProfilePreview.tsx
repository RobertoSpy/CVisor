"use client";
import React from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaGlobe } from "react-icons/fa";

type SocialLinks = { github?: string; linkedin?: string; website?: string; instagram?: string };
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
  videoUrl?: string;
};

export default function StudentProfilePreview({ profile, points = 0, badges = [] }: { profile: ProfilePayload | null, points?: number, badges?: any[] }) {
  if (!profile) return <div className="py-10 text-center text-red-500 font-semibold text-lg">Nu s-au găsit date de profil.</div>;

  const level = Math.floor(points / 100) + 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl mx-auto rounded-3xl shadow-2xl ring-1 ring-black/10 bg-white/90 p-10 flex flex-col items-center">
        {/* Avatar + Nume + Headline */}
        <div className="flex flex-col items-center w-full">
          <div className="h-32 w-32 rounded-full overflow-hidden ring-4 ring-primary bg-black/5 mb-4">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-lg text-gray-400">Avatar</div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1 text-center">{profile.name}</div>
          {profile.headline && <div className="text-primary text-lg font-semibold mb-2 text-center">{profile.headline}</div>}
        </div>

        {/* Locație */}
        {profile.location && (
          <div className="text-gray-500 flex items-center gap-2 mb-4">
            <span className="text-xl">📍</span>
            {profile.location}
          </div>
        )}

        {/* Bio */}
        {profile.bio && <div className="text-gray-700 mb-4 text-center">{profile.bio}</div>}

        {/* Social */}
        <div className="flex gap-3 flex-wrap justify-center mt-3 mb-5">
          {profile.social.github && (
            <a href={profile.social.github} target="_blank" rel="noopener noreferrer"
              className="text-gray-800 hover:text-black flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition font-medium">
              <FaGithub className="text-xl" /> GitHub
            </a>
          )}
          {profile.social.linkedin && (
            <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-800 flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition font-medium">
              <FaLinkedin className="text-xl" /> LinkedIn
            </a>
          )}
          {profile.social.instagram && (
            <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 transition font-medium">
              <FaInstagram className="text-xl" /> Instagram
            </a>
          )}
          {profile.social.website && (
            <a href={profile.social.website} target="_blank" rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition font-medium">
              <FaGlobe className="text-xl" /> Website
            </a>
          )}
        </div>

        {/* Gamification Stats */}
        <div className="flex gap-6 mb-8 bg-gradient-to-r from-primary/5 to-accent/5 px-8 py-4 rounded-2xl border border-primary/10">
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Nivel</div>
            <div className="text-2xl font-bold text-primary">Lvl {level}</div>
          </div>
          <div className="w-px bg-primary/10"></div>
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Puncte</div>
            <div className="text-2xl font-bold text-accent">{points} XP</div>
          </div>
        </div>

        {/* Badges Showcase */}
        {badges && badges.length > 0 && (
          <div className="mb-8 w-full">
            <div className="font-semibold text-gray-800 mb-4 text-center">Insigne Deblocate</div>
            <div className="flex flex-wrap gap-4 justify-center">
              {badges.map((b: any) => (
                <div key={b.id || b.code} className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 w-24" title={b.name}>
                  <div className="text-3xl mb-1">{b.icon || "🏅"}</div>
                  <div className="text-[10px] text-center font-medium leading-tight text-gray-600">{b.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video principal student */}
        {profile.videoUrl && (
          <div className="mb-12 w-full flex flex-col items-center">
            <div className="font-semibold text-gray-800 mb-2 text-center">Video prezentare</div>
            <div className="w-full rounded-2xl shadow-xl ring-2 ring-primary/20 bg-black overflow-hidden flex items-center justify-center">
              <iframe
                src={profile.videoUrl.includes("youtube.com") ? profile.videoUrl.replace("watch?v=", "embed/") : profile.videoUrl}
                className="w-full aspect-video"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Video student"
                style={{
                  minHeight: "400px",
                  height: "500px",
                  maxHeight: "700px",
                  width: "100%",
                  borderRadius: "1rem",
                  display: "block",
                }}
              />
            </div>
          </div>
        )}

        {/* Skills */}
        <div className="mb-8 w-full">
          <div className="font-semibold text-gray-800 mb-2 text-center">Skill‑uri</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {profile.skills.length ? profile.skills.map(s =>
              <span key={s} className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-medium text-sm">{s}</span>
            ) : <span className="text-gray-400">—</span>}
          </div>
        </div>

        {/* Educație */}
        <div className="mb-8 w-full">
          <div className="font-semibold text-gray-800 mb-4 text-center">Educație</div>
          <div className="flex flex-wrap gap-6 justify-center">
            {profile.education.length ? profile.education.map(edu => (
              <div key={edu.id || edu.school} className="flex items-center gap-5 p-6 rounded-2xl shadow-lg border-b-4 border-primary/30 bg-white/80 transition hover:scale-105 w-full max-w-md">
                <div className="flex-shrink-0">
                  <span className="material-icons text-3xl text-primary">school</span>
                </div>
                <div>
                  <div className="font-bold text-primary text-lg">{edu.degree}</div>
                  <div className="text-gray-700 text-md">{edu.school}</div>
                  <div className="text-gray-500 text-sm">{edu.start}{edu.end && <> – {edu.end}</>}</div>
                  {edu.details && <div className="text-gray-700 text-sm mt-2">{edu.details}</div>}
                </div>
              </div>
            )) : <span className="text-gray-400 text-center">Nu ai adăugat educație.</span>}
          </div>
        </div>

        {/* Experiență */}
        <div className="mb-8 w-full">
          <div className="font-semibold text-gray-800 mb-4 text-center">Experiență profesională</div>
          <div className="flex flex-wrap gap-6 justify-center">
            {profile.experience.length ? profile.experience.map(exp => (
              <div key={exp.id || exp.company} className="flex items-center gap-5 p-6 rounded-2xl shadow-lg border-b-4 border-primary/30 bg-white/80 transition hover:scale-105 w-full max-w-md">
                <div className="flex-shrink-0">
                  <span className="material-icons text-3xl text-primary">work</span>
                </div>
                <div>
                  <div className="font-bold text-primary text-lg">{exp.role}</div>
                  <div className="text-gray-700 text-md">{exp.company}</div>
                  <div className="text-gray-500 text-sm">{exp.start}{exp.end && <> – {exp.end}</>}</div>
                  {exp.details && <div className="text-gray-700 text-sm mt-2">{exp.details}</div>}
                </div>
              </div>
            )) : <span className="text-gray-400 text-center">Nu ai adăugat experiență.</span>}
          </div>
        </div>

        {/* Portofoliu Media */}
        <div className="mb-8 w-full">
          <div className="font-semibold text-gray-800 mb-2 text-center">Portofoliu media</div>
          <div className="flex flex-wrap gap-6 justify-center w-full">
            {profile.portfolioMedia.length ? profile.portfolioMedia.map(m => (
              <div key={m.id || m.url} className="max-w-xl w-full rounded-2xl shadow-lg ring-2 ring-primary/20 bg-black overflow-hidden flex flex-col items-center justify-center p-3">
                {m.kind === "image"
                  ? <img src={m.url} className="w-full object-contain rounded-xl" style={{ maxHeight: "400px" }} alt={m.caption || "media"} />
                  : (
                    <div className="w-full flex items-center justify-center">
                      <video
                        src={m.url}
                        controls
                        className="w-full aspect-video rounded-xl"
                        style={{ minHeight: "320px", maxHeight: "500px", background: "#000" }}
                      />
                    </div>
                  )
                }
                {m.caption && <div className="text-xs text-gray-100 text-center mt-2">{m.caption}</div>}
              </div>
            )) : (
              <span className="text-gray-400">Nu ai media încărcată.</span>
            )}
          </div>
        </div>

        {/* Oportunități */}
        {profile.opportunityRefs && profile.opportunityRefs.length > 0 && (
          <div className="mb-8 w-full">
            <div className="font-semibold text-gray-800 mb-4 text-center">Oportunități</div>
            <div className="flex flex-wrap gap-6 justify-center">
              {profile.opportunityRefs.map(o => (
                <div key={o.id || o.title} className="flex items-center gap-5 p-6 rounded-2xl shadow-lg border-b-4 border-primary/30 bg-white/80 transition hover:scale-105 w-full max-w-md">
                  <div className="flex-shrink-0">
                    <span className="material-icons text-3xl text-primary">star</span>
                  </div>
                  <div>
                    <div className="font-bold text-primary text-lg">{o.title}</div>
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}