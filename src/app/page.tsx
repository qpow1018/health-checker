import { AuthGate } from "@/features/auth/AuthGate";

export default function HomePage() {
  return <AuthGate />;
}
