

"use client";
import ProtectedLayout from "./(protected)/layout";
import Link from "next/link";
import { useAuth } from "@/components/auth/FirebaseAuthProvider";
import { UserIcon, CalendarIcon, ClipboardListIcon } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || "Usuario";
  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <main className="container mx-auto py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#475569] sm:text-4xl">
              {`¡Hola ${displayName}!`}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Sistema de gestion de pacientes y sesiones terapeuticas
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Link
                href="/patients"
                className="rounded-xl bg-[#6c63ff] px-7 py-2 text-base font-bold text-white shadow-md hover:bg-[#5548c8] transition-colors duration-150 focus-visible:outline-none"
                style={{
                  boxShadow: '0 2px 8px #6c63ff33',
                  letterSpacing: '0.01em',
                  minWidth: '180px',
                  display: 'inline-block',
                }}
              >
                <span className="flex items-center justify-center gap-2 w-full">
                  <UserIcon className="w-5 h-5" />
                  <span>Pacientes</span>
                </span>
              </Link>
              <Link
                href="/calendario"
                className="rounded-xl bg-[#6c63ff] px-7 py-2 text-base font-bold text-white shadow-md hover:bg-[#5548c8] transition-colors duration-150 focus-visible:outline-none"
                style={{
                  boxShadow: '0 2px 8px #6c63ff33',
                  letterSpacing: '0.01em',
                  minWidth: '180px',
                  display: 'inline-block',
                }}
              >
                <span className="flex items-center justify-center gap-2 w-full">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Calendario</span>
                </span>
              </Link>
              <Link
                href="/proximas-atenciones"
                className="rounded-xl bg-[#6c63ff] px-7 py-2 text-base font-bold text-white shadow-md hover:bg-[#5548c8] transition-colors duration-150 focus-visible:outline-none"
                style={{
                  boxShadow: '0 2px 8px #6c63ff33',
                  letterSpacing: '0.01em',
                  minWidth: '180px',
                  display: 'inline-block',
                }}
              >
                <span className="flex items-center justify-center gap-2 w-full">
                  <ClipboardListIcon className="w-5 h-5" />
                  <span>Próximas Atenciones</span>
                </span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  )
}