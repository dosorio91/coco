import { useState, useEffect, useCallback } from 'react'
import { Patient } from '@/lib/db/types'
import { patientFirestoreService } from '@/lib/services/patientFirestoreService'
import { useAuth } from '@/components/auth/FirebaseAuthProvider'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth();

  const loadPatients = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true)
      const data = await patientFirestoreService.getAll(user.uid)
      setPatients(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error al cargar los pacientes'))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadPatients()
  }, [loadPatients, user])

  const addPatient = async (patientData: Omit<Patient, "id">) => {
    try {
      if (!user) throw new Error('No hay usuario autenticado');
      const id = await patientFirestoreService.create({ ...patientData, userId: user.uid })
      const newPatient = { ...patientData, id, userId: user.uid }
      setPatients(prev => [...prev, newPatient])
      return newPatient
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error al crear el paciente'))
      throw e
    }
  }

  const editPatient = async (id: string, patientData: Partial<Patient>) => {
    try {
      await patientFirestoreService.update(id, patientData)
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...patientData } : p))
      return true
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error al actualizar el paciente'))
      throw e
    }
  }

  const removePatient = async (id: string) => {
    try {
      await patientFirestoreService.remove(id)
      setPatients(prev => prev.filter(p => p.id !== id))
      return true
    } catch (e) {
      throw e instanceof Error ? e : new Error('Error al eliminar el paciente')
    }
  }

  return {
    patients,
    loading,
    error,
    loadPatients,
    addPatient,
    editPatient,
    removePatient
  }
}
