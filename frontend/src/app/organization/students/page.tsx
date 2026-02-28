"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BADGES } from "@/app/student/lib/streak";

type StudentProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
  points?: number;
  badges?: string[];
};

export default function OrganizationStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Stare pentru filtre și paginare
  const [minLevel, setMinLevel] = useState<number>(0);
  const [minPoints, setMinPoints] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalStudents, setTotalStudents] = useState<number>(0);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        minLevel: minLevel.toString(),
        minPoints: minPoints.toString()
      });

      const res = await fetch(`/api/users/all?${query.toString()}`, { credentials: "include" });
      const data = await res.json();

      if (data.students) {
        setStudents(data.students);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalStudents(data.pagination?.total || 0);
      } else {
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, minLevel, minPoints]);

  const getLevelLabel = (badges: string[] = []) => {
    let levelLabel = "LVL 1";
    const sortedBadgesDefs = [...BADGES].sort((a, b) => b.points - a.points);

    for (const def of sortedBadgesDefs) {
      const hasBadge = badges.some((b: any) => {
        const code = typeof b === "string" ? b : b.code;
        return code === def.code || code === `streak_${def.points}`;
      });
      if (hasBadge) {
        levelLabel = def.label;
        break;
      }
    }
    return levelLabel;
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4">
      {/* Header & Filtre Modernizate */}
      <div className="mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Studenți</h1>
          <p className="text-gray-500 mt-2 text-lg">Descoperă viitoarele talente pentru echipa ta.</p>
        </div>

        {/* Modern Glassy/Pill Filters */}
        <div className="flex flex-wrap gap-3 items-center">

          {/* Level Filter - Pill Style */}
          <div className="relative group">
            <select
              value={minLevel}
              onChange={(e) => { setMinLevel(Number(e.target.value)); setPage(1); }}
              className="appearance-none bg-white/80 backdrop-blur-md text-gray-700 font-bold py-3 pl-5 pr-12 rounded-full border-0 shadow-sm ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:shadow-md hover:ring-blue-500/20 transition-all cursor-pointer"
            >
              <option value={0}>Nivel: Toate</option>
              <option value={1}>Nivel 1+</option>
              <option value={2}>Nivel 2+</option>
              <option value={3}>Nivel 3+</option>
              <option value={4}>Nivel 4+</option>
              <option value={5}>Nivel 5</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {/* Points Filter - Pill Style */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-3 rounded-full shadow-sm ring-1 ring-gray-200 hover:shadow-md hover:ring-blue-500/20 transition-all focus-within:ring-2 focus-within:ring-blue-500/30">
            <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Min Puncte</span>
            <input
              type="number"
              value={minPoints}
              onChange={(e) => { setMinPoints(Number(e.target.value)); setPage(1); }}
              placeholder="0"
              className="w-16 bg-transparent font-extrabold text-gray-800 focus:outline-none text-right placeholder-gray-300"
              min="0"
            />
          </div>

          <div className="bg-blue-100/50 text-blue-700 px-4 py-3 rounded-full font-bold text-sm shadow-inner hidden sm:block">
            {totalStudents}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-96 bg-gray-100 rounded-3xl"></div>)}
        </div>
      ) : !students.length ? (
        <div className="py-24 text-center">
          <div className="text-7xl mb-6 opacity-20">👋</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Niciun student găsit</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8">Nu am găsit studenți care să corespundă criteriilor tale.</p>
          <button onClick={() => { setMinLevel(0); setMinPoints(0); }} className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-black transition shadow-xl font-bold transform hover:-translate-y-1">
            Resetează Tot
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {students.map(student => (
              <Link
                key={student.id}
                href={`/organization/students/${student.id}`}
                className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 p-8 flex flex-col items-center transition-all duration-300 group border border-gray-100/50 hover:border-blue-100/50 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative mb-6">
                  <div className="h-44 w-44 rounded-full overflow-hidden bg-white ring-4 ring-white shadow-xl group-hover:scale-105 transition-all duration-500">
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-3xl text-gray-300 bg-gray-50">Avatar</div>
                    )}
                  </div>
                  {/* Level Badge - Floating Bubble */}
                  <div className="absolute -bottom-2 right-4">
                    <div className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
                      {getLevelLabel(student.badges)}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center w-full">
                  <div className="font-bold text-2xl text-gray-900 mb-1 text-center group-hover:text-blue-600 transition-colors tracking-tight leading-tight">{student.name}</div>
                  <div className="text-base text-gray-500 mb-4 text-center font-medium">{student.headline || "Student"}</div>

                  <div className="mb-6">
                    <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black tracking-wide uppercase">
                      {student.points || 0} Puncte
                    </span>
                  </div>

                  <div className="text-sm text-center text-gray-500 line-clamp-3 w-full leading-relaxed min-h-[4.5rem] px-2">
                    {(typeof student.bio === "string" ? student.bio : "")}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls - Minimal */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 py-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>

              <span className="text-gray-400 font-bold text-sm tracking-widest">
                PAGE {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}