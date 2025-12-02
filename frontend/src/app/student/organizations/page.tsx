"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type OrganizationProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
  headline?: string;
};

export default function StudentOrganizationsPage() {
  const [orgs, setOrgs] = useState<OrganizationProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/organizations/users/all", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.organizations && Array.isArray(data.organizations)) {
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

  if (loading) return <div className="p-8 text-center text-lg">Se încarcă organizațiile...</div>;
  if (!orgs.length) return <div className="p-8 text-center text-lg text-red-500">Nicio organizație găsită.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
      {orgs.map(org => (
        <Link
          key={org.id}
          href={`/student/organizations/${org.id}`}
          className="bg-white rounded-2xl shadow p-6 flex flex-col items-center hover:ring-2 hover:ring-primary transition"
        >
          <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 mb-4">
            {org.avatarUrl ? (
              <img src={org.avatarUrl} alt={org.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center text-lg text-gray-400">Avatar</div>
            )}
          </div>
          <div className="font-bold text-lg text-primary mb-1">{org.name}</div>
          <div className="text-sm text-gray-500 mb-2">{org.headline}</div>
        </Link>
      ))}
    </div>
  );
}