/**
 * Shared components barrel — components used by both student and organization dashboards.
 * Import from here to avoid cross-folder coupling between /student and /organization.
 *
 * Example:
 *   import { PremiumStatCard, GentleBanner } from "@/app/components/shared";
 */

export { default as PremiumStatCard } from "./PremiumStatCard";

// Chart components (originally in student/components/charts/)
export { default as ActivityHeatmap } from "../../student/components/charts/ActivityHeatmap";
export { default as GoalRing } from "../../student/components/charts/GoalRing";
export { default as SparklineCard } from "../../student/components/charts/SparklineCard";
export { default as OrgPostsBar } from "../../student/components/charts/OrgPostsBar";

// Streak component
export { default as StreakHeroCard } from "../../student/components/streak/StreakHeroCard";

// Dashboard primitives
export { default as GentleBanner } from "../../student/components/dashboard/GentleBanner";

// Install prompt
export { default as InstallPrompt } from "../../student/components/InstallPrompt";
