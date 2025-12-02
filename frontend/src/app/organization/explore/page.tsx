"use client";
import { useEffect, useState } from "react";
import OpportunityGrid from "../opportunities/OpportunityGrid";
import { Opportunity } from "../opportunities/types";

export default function ExplorePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<"party" | "self-development" | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string>("all");
  const [allOrganizations, setAllOrganizations] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    // Fetch opportunities
    fetch("/api/organizations/opportunities/explore", {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        setOpportunities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch all organizations
    fetch("/api/organizations/users/all", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (data.organizations && Array.isArray(data.organizations)) {
          setAllOrganizations(data.organizations);
        }
      })
      .catch((err) => console.error("Load organizations failed:", err));
  }, []);

  // Filtrare logic
  const filteredOpps = opportunities.filter(opp => {
    const matchCategory = !selectedType || opp.type === selectedType;
    const matchOrg = selectedOrg === "all" || opp.organization_name === selectedOrg;
    return matchCategory && matchOrg;
  });

  return (
    <div className="space-y-8 mt-10">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Explorează Oportunități</h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!selectedType ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
            >
              Toate
            </button>
            <button
              onClick={() => setSelectedType("party")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedType === "party" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
            >
              🎉 Party
            </button>
            <button
              onClick={() => setSelectedType("self-development")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedType === "self-development" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
            >
              🧠 Self-dev
            </button>
          </div>

          {/* Organization Filter */}
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">Toate Organizațiile</option>
            {allOrganizations.map(org => (
              <option key={org.id} value={org.name}>{org.name}</option>
            ))}
          </select>
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
