"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ApiClient from "../../../lib/api/client";

type OrganizationProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
  headline?: string;
};

export default function StudentOrganizationsPage() {
  const [orgs, setOrgs] = useState<OrganizationProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    ApiClient.get<{ organizations?: OrganizationProfile[] } | OrganizationProfile[]>(
      "/api/organizations/users/all"
    )
      .then(data => {
        if (data && !Array.isArray(data) && data.organizations && Array.isArray(data.organizations)) {
          setOrgs(data.organizations);
        } else if (Array.isArray(data)) {
          setOrgs(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredOrgs = orgs.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.headline && org.headline.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="py-10 space-y-8 mt-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Organizații</h1>
          <p className="text-gray-500 mt-2 text-lg">Descoperă companiile și cluburile partenere.</p>
        </div>

        {/* Search Filter */}
        <div className="relative group w-full md:w-96">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input
            type="text"
            placeholder="Caută o organizație..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/80 backdrop-blur-md text-gray-800 font-bold py-3 pl-12 pr-4 rounded-2xl border-0 shadow-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder-gray-400 hover:shadow-md transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-3xl"></div>)}
        </div>
      ) : !filteredOrgs.length ? (
        <div className="py-20 text-center">
          <div className="text-6xl mb-4 opacity-30">🏢</div>
          <h3 className="text-xl font-bold text-gray-900">Nicio organizație găsită</h3>
          <p className="text-gray-500">Încearcă alt termen de căutare.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredOrgs.map(org => (
            <Link
              key={org.id}
              href={`/student/organizations/${org.id}`}
              className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 p-8 flex flex-col items-center transition-all duration-300 border border-gray-100/50 hover:border-blue-100/50 relative overflow-hidden"
            >
              <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative mb-4">
                <div className="h-28 w-28 rounded-full overflow-hidden bg-white ring-4 ring-white shadow-lg group-hover:scale-110 transition-transform duration-500 relative z-10">
                  {org.avatarUrl ? (
                    <img src={org.avatarUrl} alt={org.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-lg text-gray-300 bg-gray-50 font-bold">Logo</div>
                  )}
                </div>
              </div>
              <div className="relative z-10 text-center">
                <div className="font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{org.name}</div>
                <div className="text-sm text-gray-500 font-medium line-clamp-2">{org.headline || "Organizație Parteneră"}</div>
              </div>

              <div className="mt-6 w-full">
                <div className="w-full py-2 rounded-xl bg-gray-50 text-gray-400 text-xs font-bold text-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 uppercase tracking-widest">
                  Vizitează Profilul
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}