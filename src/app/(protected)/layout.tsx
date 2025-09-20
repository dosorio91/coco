import { RequireAuth } from "@/components/auth/FirebaseAuthProvider";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}