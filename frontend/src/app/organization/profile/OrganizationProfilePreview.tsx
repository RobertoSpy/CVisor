"use client";
import React from "react";

type KeyPerson = { id?: string; name: string; role: string; responsibilities?: string };
type EventItem = { id?: string; title: string; date?: string; description?: string; tags?: string[] };
type ContactPerson = { id?: string; name: string; email: string; phone: string };
type SocialPlatform = { id?: string; name: string; url: string };
type Media = { id?: string; kind: "image" | "video"; url: string; caption?: string };

type OrgProfilePayload = {
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

export default function OrganizationProfilePreview({ profile }: { profile: OrgProfilePayload | any }) {
  if (!profile) return <div className="py-10 text-center text-red-500 font-semibold text-lg">Nu s-au găsit date de profil.</div>;

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

  // Fallback defensive pentru toate array-urile și social
  const safeProfile = {
    ...mappedProfile,
    media: mappedProfile.media ?? [],
    events: mappedProfile.events ?? [],
    keyPeople: mappedProfile.keyPeople ?? [],
    contactPersons: mappedProfile.contactPersons ?? [],
    social: mappedProfile.social ?? {},
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 flex flex-col items-center">
      {/* Card cu banner încadrat */}
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center mt-10">
        {/* Banner încadrat */}
        <div className="w-full h-48 md:h-64 lg:h-72 overflow-hidden rounded-2xl mb-4">
          {safeProfile.bannerUrl
            ? <img src={safeProfile.bannerUrl} alt="banner" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-r from-blue-500 via-primary to-pink-400 opacity-80"/>
          }
        </div>
        {/* Avatar peste banner */}
        <div className="h-32 w-32 rounded-full overflow-hidden ring-4 ring-primary bg-black/5 shadow-xl mb-4 -mt-16">
          {safeProfile.avatarUrl ? (
            <img src={safeProfile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-lg text-gray-400">Avatar</div>
          )}
        </div>
        {/* Info */}
        <div className="text-3xl font-bold text-gray-900 mb-1 text-center">{safeProfile.name}</div>
        {safeProfile.headline && <div className="text-primary text-lg font-semibold  text-center">{safeProfile.headline}</div>}
        {safeProfile.location && (
          <div className="text-gray-500 flex items-center gap-2 mt-2 justify-center">
            <span className="material-icons">location_on</span>
            {safeProfile.location}
          </div>
        )}
        {safeProfile.volunteers !== undefined && (
          <div className="text-gray-600 mt-2 text-center">Voluntari: <span className="font-semibold">{safeProfile.volunteers}</span></div>
        )}
        {safeProfile.bio && <div className="text-gray-700 mb-2 text-center mt-2">{safeProfile.bio}</div>}
        {safeProfile.history && <div className="text-gray-700 mb-2 text-center">{safeProfile.history}</div>}
        
        {/* Social */}
        <div className="flex gap-3 flex-wrap justify-center mt-3 mb-5">
          {Array.isArray(safeProfile.social)
            ? safeProfile.social.map((s: SocialPlatform) => (
                <a key={s.url || s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                   className="text-gray-800 hover:text-primary flex items-center gap-1 px-4 py-1 rounded bg-primary/10">
                  <span className="material-icons">public</span> {s.name}
                </a>
              ))
            : Object.entries(safeProfile.social).map(([name, url]) =>
                url ? <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                  className="text-gray-800 hover:text-primary flex items-center gap-1 px-4 py-1 rounded bg-primary/10">
                  <span className="material-icons">public</span> {name}
                </a> : null 
              )
          }
        </div>

        {/* Media */}
        <div className="flex flex-wrap gap-6 justify-center w-full">
          {safeProfile.media.map((m: Media) =>
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
          )}
        </div>

        {/* Oportunități & Evenimente */}
        <div className="mb-8 w-full mt-12">
          <div className="font-semibold text-gray-800 mb-4 text-center">Oportunități & Evenimente</div>
          <div className="flex flex-wrap gap-6 justify-center">
            {safeProfile.events.length ? safeProfile.events.map((ev: EventItem) => (
              <div key={ev.id || ev.title} className="flex items-center gap-5 p-6 rounded-2xl shadow-lg border-b-4 border-primary/30 bg-white/80 transition hover:scale-105 w-full max-w-md">
                {/* ICON */}
                <div className="flex-shrink-0">
                  <span className="material-icons text-3xl text-primary">event</span>
                </div>
                <div>
                  <div className="font-bold text-primary text-lg">{ev.title}</div>
                  <div className="text-gray-500 text-md">{ev.date}</div>
                  {ev.description && <div className="text-gray-700 text-sm mt-2">{ev.description}</div>}
                </div>
              </div>
            )) : <span className="text-gray-400 text-center">Nu sunt încă evenimente/opportunități adăugate.</span>}
          </div>
        </div>

        {/* Persoane cheie */}
        <div className="mb-8 w-full">
          <div className="font-semibold text-gray-800 mb-4 text-center">Persoane cheie</div>
          <div className="flex flex-wrap gap-6 justify-center">
            {safeProfile.keyPeople.length ? safeProfile.keyPeople.map((pers: KeyPerson) => (
              <div key={pers.id || pers.name} className="flex items-center gap-5 p-6 rounded-2xl shadow-lg border-b-4 border-primary/30 bg-white/80 transition hover:scale-105 w-full max-w-md">
                {/* ICON */}
                <div className="flex-shrink-0">
                  <span className="material-icons text-3xl text-primary">person</span>
                </div>
                <div>
                  <div className="font-bold text-primary text-lg">{pers.name}</div>
                  <div className="text-primary text-md">{pers.role}</div>
                  {pers.responsibilities && <div className="text-gray-700 text-sm mt-2">{pers.responsibilities}</div>}
                </div>
              </div>
            )) : <span className="text-gray-400 text-center">Nu ai persoane cheie adăugate.</span>}
          </div>
        </div>

        {/* Persoane de contact */}
        <div className="mb-8 w-full">
          <div className="font-semibold text-gray-800 mb-4 text-center">Persoane de contact</div>
          <div className="flex flex-wrap gap-6 justify-center">
            {safeProfile.contactPersons.length ? safeProfile.contactPersons.map((person: ContactPerson) => (
              <div key={person.id || person.email} className="flex items-center gap-5 p-6 rounded-2xl shadow-lg border-b-4 border-primary/30 bg-white/80 transition hover:scale-105 w-full max-w-md">
                {/* ICON */}
                <div className="flex flex-col gap-2 items-center">
                  <span className="material-icons text-3xl text-primary">call</span>
                </div>
                <div>
                  <div className="font-bold text-primary text-lg">{person.name}</div>
                  <div className="text-gray-700 text-md flex items-center gap-2">
                    <span className="material-icons text-base text-primary">mail</span>
                    {person.email}
                  </div>
                  <div className="text-gray-500 text-md flex items-center gap-2">
                    <span className="material-icons text-base text-green-600">phone</span>
                    {person.phone}
                  </div>
                </div>
              </div>
            )) : <span className="text-gray-400 text-center">Nu ai persoane de contact adăugate.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}