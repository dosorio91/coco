
"use client";
import { useAuth, LogoutButton } from "@/components/auth/FirebaseAuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";

export function Header() {
  const pathname = usePathname();
  const activeColor = "#6c63ff";
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="mr-4 flex ml-10">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span
              className={
                `inline-block font-bold transition-colors ${pathname === "/" ? "text-["+activeColor+"]" : "text-foreground/60"}`
              }
              style={pathname === "/" ? { color: activeColor, fontWeight: 700 } : {}}
            >
              Inicio
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/patients"
              className={
                `transition-colors ${(pathname ?? "").startsWith("/patients") ? "font-bold text-["+activeColor+"]" : "text-foreground/60"}`
              }
              style={(pathname ?? "").startsWith("/patients") ? { color: activeColor, fontWeight: 700 } : {}}
            >
              Pacientes
            </Link>
            <Link
              href="/calendario"
              className={
                `transition-colors ${(pathname ?? "").startsWith("/calendario") ? "font-bold text-["+activeColor+"]" : "text-foreground/60"}`
              }
              style={(pathname ?? "").startsWith("/calendario") ? { color: activeColor, fontWeight: 700 } : {}}
            >
              Calendario
            </Link>
            <Link
              href="/proximas-atenciones"
              className={
                `transition-colors ${(pathname ?? "").startsWith("/proximas-atenciones") ? "font-bold text-["+activeColor+"]" : "text-foreground/60"}`
              }
              style={(pathname ?? "").startsWith("/proximas-atenciones") ? { color: activeColor, fontWeight: 700 } : {}}
            >
              Próximas Atenciones
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 mr-6">
          {user && (
            <>
              <Link href="/perfil" title="Perfil">
                <Avatar src={user.photoURL || undefined} alt="Perfil" size={36} className="hover:ring-2 hover:ring-[#6c63ff] transition" />
              </Link>
              <span className="text-sm text-gray-700">{user.displayName || user.email}</span>
              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
