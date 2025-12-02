"use client";
import { useEffect, useState, useMemo } from "react";
import type { Opportunity } from "../../organization/opportunities/types";
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
    fetch("/api/opportunities", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => setOpportunities(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Load opportunities failed:", err);
        setOpportunities([]);
      })
      .finally(() => setLoading(false));

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

  // Filter logic
  const filteredOpps = opportunities.filter(opp => {
    const matchCategory = selectedCategory === "all" || opp.type === selectedCategory;
    const matchOrg = selectedOrg === "all" || opp.orgName === selectedOrg;
    return matchCategory && matchOrg;
  });

  return (
    <div className="space-y-8 mt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">
          Oportunități
        </h1>

        {/* Filters Area */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === "all" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
            >
              Toate
            </button>
            <button
              onClick={() => setSelectedCategory("party")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === "party" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
            >
              🎉 Party
            </button>
            <button
              onClick={() => setSelectedCategory("self-development")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === "self-development" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
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