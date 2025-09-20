import ProtectedLayout from "../(protected)/layout";

export default function PatientsProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
