import { useState, useEffect, useCallback } from 'react'
import { Patient } from '@/lib/db/types'
import { patientFirestoreService } from '@/lib/services/patientFirestoreService'

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true)
      const data = await patientFirestoreService.getAll()
      setPatients(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Error al cargar los pacientes'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  const addPatient = async (patientData: Omit<Patient, "id">) => {
    try {
      const id = await patientFirestoreService.create(patientData)
      const newPatient = { ...patientData, id }
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
