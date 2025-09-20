import ProtectedLayout from "../(protected)/layout";

export default function CalendarioProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
