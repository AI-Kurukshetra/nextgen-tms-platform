import { RateCalculator } from "@/components/rates/RateCalculator";

export default function RatesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Rate Management</h1>
      <p className="text-sm text-gray-600">Dynamic quote calculator for freight pricing.</p>
      <RateCalculator />
    </div>
  );
}
