
"use client";
import { useAuth } from "@/components/auth/FirebaseAuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { UserIcon, CalendarIcon, ClipboardListIcon } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  // Detectar móvil (simple, usando window width)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  return (
    <header className="sticky top-0 z-50">
      {/* Barra superior morada */}
  <div className="w-full bg-[#635bff] flex items-center justify-between px-4 py-3">
        <div style={{ width: 36 }} />
        <span className="text-white font-bold text-lg text-center flex-1">ClinicApp Fono</span>
        {user && (
          <Link href="/perfil" title="Perfil">
            <Avatar src={user.photoURL || undefined} alt="Perfil" size={32} className="hover:ring-2 hover:ring-white transition" />
          </Link>
        )}
      </div>
      {/* Franja verde con tabs en todas las vistas */}
      <nav className="w-full bg-[#2ED8C3] flex justify-around py-2">
        <Link href="/patients">
          <span className="flex flex-col items-center text-xs font-bold text-white">
            Pacientes
          </span>
        </Link>
        <Link href="/proximas-atenciones">
          <span className="flex flex-col items-center text-xs font-bold text-white">
            Próximas Atenciones
          </span>
        </Link>
        <Link href="/calendario">
          <span className="flex flex-col items-center text-xs font-bold text-white">
            Calendario
          </span>
        </Link>
      </nav>
    </header>
  );
}
