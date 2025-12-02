import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json());

export default function useOrganizationData() {
  // 1. Points (Using same endpoint as student/generic user)
  const { data: pointsData, mutate: mutatePoints } = useSWR('/api/students/points', fetcher);

  // 2. Badges
  const { data: badgesData, mutate: mutateBadges } = useSWR('/api/students/badges', fetcher);

  // 3. Presence / Heatmap (Organization specific)
  const { data: presenceData, mutate: mutatePresence } = useSWR('/api/organizations/stats/presence?days=35', fetcher);

  // 4. Org Stats
  const { data: orgData } = useSWR('/api/analytics/orgs/posts?weeks=8', fetcher);

  return {
    points: pointsData?.points ?? 0,
    badges: Array.isArray(badgesData?.badges) ? badgesData.badges : [],
    heatmapData: presenceData?.map ?? {},
    createdAt: presenceData?.createdAt ?? null,
    orgBars: orgData ?? [],
    mutatePoints,
    mutateBadges,
    mutatePresence
  };
}
