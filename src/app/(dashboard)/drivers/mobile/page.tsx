import { MobileDriverBoard } from "@/components/drivers/MobileDriverBoard";
import { getDriverAssignments, getDrivers } from "@/lib/actions/drivers";

export default async function DriversMobilePage() {
  const [drivers, assignments] = await Promise.all([getDrivers(), getDriverAssignments()]);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Mobile Driver App</h1>
      <p className="text-sm text-gray-600">Driver-first view for assignments and availability updates.</p>
      <MobileDriverBoard drivers={drivers.data ?? []} assignments={assignments.data ?? []} />
    </div>
  );
}
