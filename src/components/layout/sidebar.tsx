"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Pacientes",
    href: "/patients",
    icon: Users,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex w-20 flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="sr-only">Fenix Clinic</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        pathname === item.href
                          ? "bg-gray-50 text-[#00d632]"
                          : "text-gray-700 hover:text-[#00d632] hover:bg-gray-50",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <item.icon
                        className={cn(
                          pathname === item.href
                            ? "text-[#00d632]"
                            : "text-gray-400 group-hover:text-[#00d632]",
                          "h-6 w-6 shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      <span className="sr-only">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
