import { Session } from "@/lib/db/types"

// Clave para el almacenamiento local
const STORAGE_KEY = "clinic_sessions"

// Función para generar un ID único
const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Función para obtener todas las sesiones
export const getSessions = (patientId: string): Session[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEY)
  const sessions = stored ? JSON.parse(stored) : []
  return sessions
    .filter((session: Session) => session.patientId === patientId)
    .sort((a: Session, b: Session) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Función para crear una nueva sesión
export const createSession = (patientId: string, sessionData: Omit<Session, "id" | "patientId" | "createdAt" | "updatedAt">): Session => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const sessions = stored ? JSON.parse(stored) : []
  const now = new Date().toISOString()
  
  const newSession: Session = {
    ...sessionData,
    id: generateId(),
    patientId,
    createdAt: now,
    updatedAt: now,
  }
  
  sessions.push(newSession)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  
  return newSession
}

// Función para actualizar una sesión
export const updateSession = (id: string, sessionData: Partial<Omit<Session, "id" | "patientId" | "createdAt" | "updatedAt">>): Session | null => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const sessions = stored ? JSON.parse(stored) : []
  const index = sessions.findIndex((session: Session) => session.id === id)
  
  if (index === -1) return null
  
  const updatedSession: Session = {
    ...sessions[index],
    ...sessionData,
    updatedAt: new Date().toISOString(),
  }
  
  sessions[index] = updatedSession
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  
  return updatedSession
}

// Función para eliminar una sesión
export const deleteSession = (id: string): boolean => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const sessions = stored ? JSON.parse(stored) : []
  const filteredSessions = sessions.filter((session: Session) => session.id !== id)
  
  if (filteredSessions.length === sessions.length) return false
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions))
  return true
}

// Exportación de getSessionById
export const getSessionById = (id: string): Session | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(STORAGE_KEY)
  const sessions = stored ? JSON.parse(stored) : []
  return sessions.find((session: Session) => session.id === id) || null
}
