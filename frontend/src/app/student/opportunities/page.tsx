"use client";
import { useEffect, useState, useMemo } from "react";
import type { Opportunity } from "@/lib/types";
import { opportunities as opportunitiesApi } from "@/lib/api/opportunities";
import StudentOpportunityGrid from "./StudentOpportunityGrid";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<"all" | "party" | "self-development">("all");
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [allOrganizations, setAllOrganizations] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    // Fetch opportunities
    opportunitiesApi.getAll()
      .then((data) => setOpportunities(Array.isArray(data) ? data : []))
      .catch((err: any) => {
        console.error("Load opportunities failed:", err);
        setOpportunities([]);
      })
      .finally(() => setLoading(false));

    // Fetch all organizations
    opportunitiesApi.getOrganizations()
      .then((data) => {
        if (data?.organizations && Array.isArray(data.organizations)) {
          setAllOrganizations(data.organizations);
        }
      })
      .catch((err: any) => console.error("Load organizations failed:", err));
  }, []);

  // Filter logic
  const filteredOpps = opportunities.filter(opp => {
    const matchCategory = selectedCategory === "all" || opp.type === selectedCategory;
    const matchOrg = selectedOrg === "all" || opp.orgName === selectedOrg;
    return matchCategory && matchOrg;
  });

  return (
    <div className="space-y-8 mt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Oportunități</h1>
          <p className="text-gray-500 mt-2 text-lg">Găsește oportunitatea perfectă pentru tine.</p>
        </div>

        {/* Filters Area - Modern Pills */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">

          {/* Category Filter */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedCategory === "all" ? "bg-white shadow-md text-gray-900 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              Toate
            </button>
            <button
              onClick={() => setSelectedCategory("party")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedCategory === "party" ? "bg-white shadow-md text-gray-900 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              🎉 Party
            </button>
            <button
              onClick={() => setSelectedCategory("self-development")}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedCategory === "self-development" ? "bg-white shadow-md text-gray-900 ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              🧠 Self-dev
            </button>
          </div>

          {/* Organization Filter - Modern Select */}
          <div className="relative group w-full sm:w-auto">
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white/80 backdrop-blur-md text-gray-700 font-bold py-3 pl-5 pr-12 rounded-2xl border-0 shadow-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:shadow-md hover:ring-blue-500/20 transition-all cursor-pointer"
            >
              <option value="all">Filtrează după Organizație</option>
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

      {/* Grid-ul de oportunități */}
      {filteredOpps.length === 0 && selectedOrg !== "all" && !loading ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <div className="text-4xl mb-3">🌟</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Încă nu au postat nimic
          </h3>
          <p className="text-gray-500">
            Organizația <strong>{selectedOrg}</strong> nu are oportunități active momentan.
            <br />
            Revino mai târziu pentru noutăți!
          </p>
        </div>
      ) : (
        <StudentOpportunityGrid
          opportunities={filteredOpps}
          loading={loading}
        />
      )}
    </div>
  );
}