"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import OrganizationProfilePreview from "../../../organization/profile/OrganizationProfilePreview";

export default function OrganizationProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/organizations/users/${id}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile || data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);
  if (loading) return <div className="py-10 text-center text-primary font-semibold text-lg">Se încarcă profilul...</div>;
  if (!profile) return <div className="py-10 text-center text-red-500 font-semibold text-lg">Nu s-au găsit date de profil.</div>;

  return (
    <OrganizationProfilePreview
      profile={profile}
      opportunities={profile.opportunities || []}
      points={profile.points || 0}
      badges={profile.badges || []}
    />
  );
}