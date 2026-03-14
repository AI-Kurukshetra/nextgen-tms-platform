import { PageLoader } from "@/components/ui/PageLoader";

export default function DashboardLoading() {
  return <PageLoader title="Refreshing dashboard" subtitle="Syncing shipments, carriers, and live metrics..." />;
}
