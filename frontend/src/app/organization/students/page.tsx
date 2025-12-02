"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type StudentProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
};

export default function OrganizationStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/all", {
      credentials: "include"
    })
      .then(r => r.json())
      .then(data => setStudents(data.students ?? data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-lg">Se încarcă studenții...</div>;
  if (!students.length) return <div className="p-8 text-center text-lg text-red-500">Niciun student găsit.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
      {students.map(student => (
        <Link
          key={student.id}
          href={`/organization/students/${student.id}`}
          className="bg-white rounded-2xl shadow p-6 flex flex-col items-center hover:ring-2 hover:ring-primary transition"
        >
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 mb-4">
            {student.avatarUrl ? (
              <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-lg text-gray-400">Avatar</div>
            )}
          </div>
          <div className="font-bold text-lg text-primary mb-1">{student.name}</div>
          <div className="text-sm text-gray-500 mb-2">{student.headline}</div>
          <div className="text-xs text-center text-gray-600"> {(typeof student.bio === "string" ? student.bio.slice(0, 80) : "")}{typeof student.bio === "string" && student.bio.length > 80 ? "..." : ""}</div>
        </Link>
      ))}
    </div>
  );
}