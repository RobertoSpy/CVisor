
"use client";
import React from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaGlobe } from "react-icons/fa";

type KeyPerson = { id?: string; name: string; role: string; responsibilities?: string };
type EventItem = { id?: string; title: string; date?: string; description?: string; tags?: string[] };
type ContactPerson = { id?: string; name: string; email: string; phone: string };
type SocialPlatform = { id?: string; name: string; url: string };
type Media = { id?: string; kind: "image" | "video"; url: string; caption?: string };

export type Opportunity = {
  id: string;
  title: string;
  type: string;
  orgName?: string;
  skills: string[];
  deadline: string;
  banner_image?: string;
  is_pinned_on_profile?: boolean;
};

type OrgProfilePayload = {
  id?: string;
  name: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  history?: string;
  videoUrl?: string;
  location?: string;
  volunteers?: number;
  social: SocialPlatform[] | Record<string, string>;
  events: EventItem[];
  keyPeople: KeyPerson[];
  contactPersons: ContactPerson[];
  media: Media[];
};

interface Props {
  profile: OrgProfilePayload | any;
  opportunities?: Opportunity[];
  isOwner?: boolean;
  onTogglePin?: (oppId: string, currentStatus: boolean) => void;
  points?: number;
  badges?: any[];
}

export default function OrganizationProfilePreview({
  profile,
  opportunities = [],
  isOwner = false,
  onTogglePin,
  points = 0,
  badges = []
}: Props) {
  if (!profile) return <div className="py-10 text-center text-red-500 font-semibold text-lg">Nu s-au găsit date de profil.</div>;

  const level = Math.floor(points / 100) + 1;

  // Mapping de la underscore la camelCase
  const mappedProfile = {
    ...profile,
    avatarUrl: profile.avatarUrl ?? profile.avatar_url,
    bannerUrl: profile.bannerUrl ?? profile.banner_url,
    keyPeople: profile.keyPeople ?? profile.key_people ?? [],
    contactPersons: profile.contactPersons ?? profile.contact_persons ?? [],
    media: profile.media ?? [],
    events: profile.events ?? [],
    social: profile.social ?? {},
    videoUrl: profile.videoUrl ?? profile.video_url,
    history: profile.history ?? "",
  };

  const safeProfile = {
    ...mappedProfile,
    media: mappedProfile.media ?? [],
    events: mappedProfile.events ?? [],
    keyPeople: mappedProfile.keyPeople ?? [],
    contactPersons: mappedProfile.contactPersons ?? [],
    social: mappedProfile.social ?? {},
  };

  // Helper pentru afișare social
  const renderSocial = () => {
    // Normalizăm structura socială pentru a fi un obiect simplu
    const socialLinks = Array.isArray(safeProfile.social)
      ? safeProfile.social.reduce((acc: any, curr: any) => ({ ...acc, [curr.name.toLowerCase()]: curr.url }), {})
      : safeProfile.social;

    return (
      <div className="flex gap-3 flex-wrap justify-center mt-4 mb-6">
        {socialLinks.facebook && (
          <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
            className="text-blue-700 hover:text-blue-800 flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition font-medium">
            <FaFacebook className="text-xl" /> Facebook
          </a>
        )}
        {socialLinks.instagram && (
          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-700 flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 transition font-medium">
            <FaInstagram className="text-xl" /> Instagram
          </a>
        )}
        {socialLinks.website && (
          <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition font-medium">
            <FaGlobe className="text-xl" /> Website
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 flex flex-col items-center">
      {/* Card Principal */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden mt-10">

        {/* Banner */}
        <div className="w-full h-48 md:h-64 relative bg-gray-200">
          {safeProfile.bannerUrl ? (
            <img src={safeProfile.bannerUrl} alt="banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 via-primary to-pink-400 opacity-80" />
          )}
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col items-center -mt-20 mb-6">
            {/* Avatar */}
            <div className="h-40 w-40 rounded-full overflow-hidden ring-4 ring-white bg-white shadow-lg z-10">
              {safeProfile.avatarUrl ? (
                <img src={safeProfile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-xl">
                  ORG
                </div>
              )}
            </div>

            {/* Name & Headline */}
            <h1 className="text-3xl font-bold text-gray-900 mt-4 text-center">{safeProfile.name}</h1>
            {safeProfile.headline && (
              <p className="text-primary text-lg font-medium text-center mt-1">{safeProfile.headline}</p>
            )}

            {/* Location & Volunteers */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-sm text-gray-600">
              {safeProfile.location && (
                <div className="flex items-center gap-1">
                  <span className="text-lg">📍</span>
                  <span>{safeProfile.location}</span>
                </div>
              )}
              {safeProfile.volunteers !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="material-icons text-gray-400 text-lg">group</span>
                  <span>{safeProfile.volunteers} voluntari</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {renderSocial()}

            {/* Bio */}
            {safeProfile.bio && (
              <p className="text-gray-700 text-center max-w-2xl leading-relaxed mb-6">{safeProfile.bio}</p>
            )}

            {/* Gamification Stats (Level & Points) */}
            <div className="flex gap-6 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-4 rounded-2xl border border-blue-100">
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Nivel</div>
                <div className="text-2xl font-bold text-primary">Lvl {level}</div>
              </div>
              <div className="w-px bg-blue-200"></div>
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Puncte</div>
                <div className="text-2xl font-bold text-indigo-600">{points} XP</div>
              </div>
            </div>

            {/* Badges Showcase */}
            {badges && badges.length > 0 && (
              <div className="mb-8 w-full">
                <div className="font-semibold text-gray-800 mb-4 text-center">Insigne Deblocate</div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {badges.map((b: any, idx: number) => (
                    <div key={idx} className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 w-24" title={b}>
                      <div className="text-3xl mb-1">🏅</div>
                      <div className="text-[10px] text-center font-medium leading-tight text-gray-600">{b}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-100 my-8" />

          {/* History */}
          {safeProfile.history && (
            <div className="mb-10 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">Povestea Noastră</h2>
              <p className="text-gray-700 text-center leading-relaxed whitespace-pre-line">{safeProfile.history}</p>
            </div>
          )}

          {/* Team Section */}
          {safeProfile.keyPeople.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 justify-center">
                <span className="material-icons text-primary">groups</span> Echipa Noastră
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeProfile.keyPeople.map((pers: KeyPerson) => (
                  <div key={pers.id || pers.name} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0 text-lg">
                      {pers.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{pers.name}</div>
                      <div className="text-sm text-primary font-medium">{pers.role}</div>
                      {pers.responsibilities && <div className="text-xs text-gray-500 mt-1">{pers.responsibilities}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section */}
          {safeProfile.contactPersons.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 justify-center">
                <span className="material-icons text-primary">contact_phone</span> Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeProfile.contactPersons.map((person: ContactPerson) => (
                  <div key={person.id || person.email} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold flex-shrink-0 text-lg">
                      <span className="material-icons">call</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{person.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <span className="material-icons text-[14px]">email</span> {person.email}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <span className="material-icons text-[14px]">phone</span> {person.phone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media / Video Section */}
          {(safeProfile.videoUrl || safeProfile.media.length > 0) && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Media & Prezentare</h2>

              {/* Video URL */}
              {safeProfile.videoUrl && (
                <div className="mb-8 w-full max-w-2xl mx-auto">
                  <div className="w-full rounded-2xl shadow-xl ring-2 ring-gray-100 bg-black overflow-hidden flex items-center justify-center">
                    <iframe
                      src={safeProfile.videoUrl.includes("youtube.com") ? safeProfile.videoUrl.replace("watch?v=", "embed/") : safeProfile.videoUrl}
                      className="w-full aspect-video"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title="Video organizatie"
                      style={{ minHeight: "300px" }}
                    />
                  </div>
                </div>
              )}

              {/* Gallery */}
              <div className="flex flex-wrap gap-6 justify-center">
                {safeProfile.media.map((m: Media) => (
                  <div key={m.id || m.url} className="max-w-md w-full rounded-2xl shadow-md overflow-hidden bg-black">
                    {m.kind === "image" ? (
                      <img src={m.url} className="w-full object-contain" style={{ maxHeight: "300px" }} alt={m.caption || "media"} />
                    ) : (
                      <video src={m.url} controls className="w-full aspect-video" style={{ background: "#000" }} />
                    )}
                    {m.caption && <div className="p-2 text-xs text-gray-300 text-center bg-gray-900">{m.caption}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Oportunități (Moved to bottom) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-bold text-gray-800">🔥 Oportunități</h2>
              {isOwner && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Max 5 fixate
                </span>
              )}
            </div>

            {opportunities.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500">
                Nu există oportunități active momentan.
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-6 snap-x px-2 scrollbar-hide">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="min-w-[280px] md:min-w-[320px] snap-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group relative flex-shrink-0"
                  >
                    {/* Pin Button (Owner Only) */}
                    {isOwner && onTogglePin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onTogglePin(opp.id, !!opp.is_pinned_on_profile);
                        }}
                        className={`absolute top - 2 right - 2 z - 10 px - 3 py - 1.5 rounded - full shadow - sm backdrop - blur - sm transition flex items - center gap - 1 text - xs font - bold ${opp.is_pinned_on_profile
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-white/90 text-gray-500 hover:text-blue-600 hover:bg-white"
                          } `}
                        title={opp.is_pinned_on_profile ? "Scoate de la profil" : "Fixează la profil"}
                      >
                        <span className="material-icons text-sm">
                          {opp.is_pinned_on_profile ? "push_pin" : "push_pin"}
                        </span>
                        {opp.is_pinned_on_profile ? "PINNED" : "PIN"}
                      </button>
                    )}

                    <Link href={`/ student / opportunities / ${opp.id} `} className="block h-full">
                      <div className="h-36 bg-gray-200 relative">
                        {opp.banner_image ? (
                          <img src={opp.banner_image} alt={opp.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                            No Image
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-primary shadow-sm">
                          {opp.type}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition mb-1">
                          {opp.title}
                        </h3>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(opp.skills || []).slice(0, 2).map((skill: string) => (
                            <span key={skill} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <span className="material-icons text-[14px]">calendar_today</span>
                          Deadline: {new Date(opp.deadline).toLocaleDateString("ro-RO")}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
