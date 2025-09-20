"use client"

import { createContext, useContext, useEffect, useState } from "react"

type LocalStorageContextType = {
  getItem: <T>(key: string) => T | null
  setItem: <T>(key: string, value: T) => void
  removeItem: (key: string) => void
}

const LocalStorageContext = createContext<LocalStorageContextType | undefined>(
  undefined
)

export function LocalStorageProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getItem = <T,>(key: string): T | null => {
    if (!isClient) return null
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  const setItem = <T,>(key: string, value: T) => {
    if (!isClient) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving to localStorage:`, error)
    }
  }

  const removeItem = (key: string) => {
    if (!isClient) return
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage:`, error)
    }
  }

  const value = {
    getItem,
    setItem,
    removeItem,
  }

  return (
    <LocalStorageContext.Provider value={value}>
      {children}
    </LocalStorageContext.Provider>
  )
}

export function useLocalStorage() {
  const context = useContext(LocalStorageContext)
  if (context === undefined) {
    throw new Error("useLocalStorage must be used within a LocalStorageProvider")
  }
  return context
}
