import { PageLoader } from "@/components/ui/PageLoader";

export default function AuthLoading() {
  return <PageLoader title="Loading authentication" subtitle="Checking secure access..." />;
}
