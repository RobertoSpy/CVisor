"use client";
import { useState } from "react";
import StudentOpportunityCard from "./StudentOpportunityCard";
import type { Opportunity } from "@/lib/types";

type Props = {
  opportunities: Opportunity[];
  loading: boolean;
};

const ITEMS_PER_PAGE = 9;

export default function StudentOpportunityGrid({ opportunities, loading }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <li key={i} className="bg-card rounded-2xl p-5 ring-1 ring-black/5 shadow animate-pulse">
            <div className="h-3 w-24 bg-black/10 rounded mb-2" />
            <div className="h-5 w-3/4 bg-black/10 rounded mb-3" />
            <div className="h-3 w-20 bg-black/10 rounded mb-3" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-black/10 rounded" />
              <div className="h-6 w-20 bg-black/10 rounded" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!opportunities?.length) {
    return (
      <div className="bg-card rounded-2xl p-8 text-center ring-1 ring-black/5 shadow">
        <h3 className="text-lg font-semibold tracking-tight">Nicio oportunitate disponibilă.</h3>
      </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(opportunities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = opportunities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((opp) => (
          <StudentOpportunityCard key={opp.id} opportunity={opp} />
        ))}
      </ul>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Anterior
          </button>

          <span className="text-sm font-medium text-gray-600">
            Pagina {currentPage} din {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Următor
          </button>
        </div>
      )}
    </div>
  );
}
