"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"
import { LocalStorageProvider } from "@/lib/context/local-storage-provider"

interface ProvidersProps {
  children: React.ReactNode
}

const Providers = ({ children }: ProvidersProps) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LocalStorageProvider>
        {children}
      </LocalStorageProvider>
    </ThemeProvider>
  )
}

export { Providers }
