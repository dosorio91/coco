
import ProtectedLayout from "./(protected)/layout";
import Link from "next/link";

export default function Home() {
  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <main className="container mx-auto py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-[#475569] sm:text-6xl">
              ¡Hola Constanza!
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
                Ir a Pacientes
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
                Ir al Calendario
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
                Próximas Atenciones
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedLayout>
  )
}