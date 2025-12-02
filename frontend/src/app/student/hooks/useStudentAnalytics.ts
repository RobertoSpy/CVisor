import { useEffect, useState } from "react";

type OrgBar = { label: string; value: number };

export default function useStudentAnalytics(
  trigger = true
) {
  const STUDENT_ANALYTICS = "/api/students/stats";
  const ORG_ANALYTICS = "/api/analytics/orgs";

  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [orgBars, setOrgBars] = useState<OrgBar[]>([]);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!trigger) return;
    let ignore = false;

    (async () => {
      try {
        const pres = await fetch(`${STUDENT_ANALYTICS}/presence?days=35`, { credentials: "include" });
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
        const org = await fetch(`${ORG_ANALYTICS}/posts?weeks=8`, { credentials: "include" });
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
  }, [STUDENT_ANALYTICS, ORG_ANALYTICS, trigger]);

  return { heatmapData, orgBars, createdAt, setHeatmapData, setOrgBars };
}