"use client";
import { useEffect, useState } from "react";
import OpportunityGrid from "../opportunities/OpportunityGrid";
import { Opportunity } from "../opportunities/types";
import ApiClient from "../../../lib/api/client";

export default function ExplorePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<"party" | "self-development" | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [allOrganizations, setAllOrganizations] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch current user first (to filter self out)
        const user = await ApiClient.get<{ id?: string } | null>("/api/auth/me").catch(() => null);
        const myId = user?.id;

        // 2. Fetch opportunities and organizations in parallel
        const [oppsData, orgsData] = await Promise.all([
          ApiClient.get<Opportunity[]>("/api/organizations/opportunities/explore").catch(() => []),
          ApiClient.get<{ organizations?: { id: string; name: string }[] }>("/api/organizations/users/all").catch(() => null),
        ]);

        setOpportunities(oppsData);

        if (orgsData?.organizations && Array.isArray(orgsData.organizations)) {
          // Filter out self
          const filteredList = orgsData.organizations.filter((o) => o.id !== myId);
          setAllOrganizations(filteredList);
        }
      } catch (err) {
        console.error("Failed to load explore data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtrare logic
  const filteredOpps = opportunities.filter(opp => {
    const matchCategory = !selectedType || opp.type === selectedType;
    const matchOrg = selectedOrg === "all" || opp.organization_name === selectedOrg;
    return matchCategory && matchOrg;
  });

  return (
    <div className="space-y-8 mt-10">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Explorează</h1>
          <p className="text-gray-500 mt-2 text-lg">Descoperă oportunități de la alți organizatori.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          {/* Category Filter */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedType(null)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${!selectedType ? "bg-white shadow-md text-gray-900 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              Toate
            </button>
            <button
              onClick={() => setSelectedType("party")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedType === "party" ? "bg-white shadow-md text-gray-900 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              🎉 Party
            </button>
            <button
              onClick={() => setSelectedType("self-development")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedType === "self-development" ? "bg-white shadow-md text-gray-900 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              🧠 Self-dev
            </button>
          </div>

          {/* Organization Filter */}
          <div className="relative group w-full sm:w-auto">
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white/80 backdrop-blur-md text-gray-700 font-bold py-3 pl-5 pr-12 rounded-2xl border-0 shadow-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:shadow-md hover:ring-blue-500/20 transition-all cursor-pointer"
            >
              <option value="all">Toate Organizațiile</option>
              {allOrganizations.map(org => (
                <option key={org.id} value={org.name}>{org.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>



      <OpportunityGrid
        opportunities={filteredOpps}
        loading={loading}
        onEdit={() => { }}
        onDelete={() => { }}
        readOnly={true}
      />
    </div>
  );
}
