import type { Metadata } from "next";

import { HealthScreen } from "@/components/health-screen";

export const metadata: Metadata = {
  title: "Health",
};

export default function HomePage() {
  return <HealthScreen />;
}
