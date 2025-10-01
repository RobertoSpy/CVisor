import { useEffect, useState } from "react";

type OrgBar = { label: string; value: number };

export default function useStudentAnalytics(
 
  trigger = true
) {
  const ORG1_ANALYTICS = "/api/organizations/stats";
  const ORG2_ANALYTICS = "/api/analytics/orgs";

  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [orgBars, setOrgBars] = useState<OrgBar[]>([]);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!trigger) return;
    let ignore = false;
    const token = localStorage.getItem("token") || "";
    const auth = { Authorization: `Bearer ${token}` };

    (async () => {
      try {
        const pres = await fetch(`${ORG1_ANALYTICS}/presence?days=35`, { credentials: "include", headers: auth });
        if (pres.ok) {
          const payload = await pres.json();
          // dacă backendul întoarce { map, createdAt }
          if (!ignore) {
            if (payload.map) {
              setHeatmapData(payload.map);
              setCreatedAt(payload.createdAt || null);
            } else {
              setHeatmapData(payload || {});
              setCreatedAt(null);
            }
          }
        }
        const org = await fetch(`${ORG2_ANALYTICS}/posts?weeks=8`, { credentials: "include", headers: auth });
        if (org.ok) {
          const payload: OrgBar[] = await org.json();
          if (!ignore) setOrgBars(payload || []);
        }
      } catch {
        if (ignore) return;
        setHeatmapData({});
        setOrgBars([]);
        setCreatedAt(null);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [ORG1_ANALYTICS, ORG2_ANALYTICS, trigger]);

  return { heatmapData, orgBars, createdAt, setHeatmapData, setOrgBars };
}