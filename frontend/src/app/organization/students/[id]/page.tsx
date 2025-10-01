"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// Importă componenta!
import StudentProfilePreview from "../../../student/profile/StudentProfilePreview"; 

export default function OrganizationStudentProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!id) return;
  const token = localStorage.getItem("token");
  fetch(`/api/users/${id}`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
    .then(r => r.json())
    .then(data => setProfile(data))
    .finally(() => setLoading(false));
}, [id]);

  if (loading) return <div className="py-10 text-center text-primary font-semibold text-lg">Se încarcă profilul...</div>;
  if (!profile) return <div className="py-10 text-center text-red-500 font-semibold text-lg">Nu s-au găsit date de profil.</div>;

  return (
    <StudentProfilePreview profile={profile} />
  );
}