import ProtectedLayout from "../(protected)/layout";

export default function PerfilesProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
