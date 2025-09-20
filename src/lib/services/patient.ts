import { Patient } from "@/lib/db/types"
import localStorageRepo from "@/lib/db/localStorageRepo"

// Get all patients
const getPatients = (): Patient[] => {
  return localStorageRepo.getAll()
}

// Get patient by ID
const getPatientById = (id: string): Patient | null => {
  return localStorageRepo.getById(id)
}

// Create new patient
const createPatient = (patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">): Patient => {
  const now = new Date().toISOString()
  const newPatient = {
    ...patientData,
    createdAt: now,
    updatedAt: now,
  }
  
  return localStorageRepo.create(newPatient)
}

// Update patient
const updatePatient = (id: string, patientData: Partial<Omit<Patient, "id" | "createdAt" | "updatedAt">>): Patient | null => {
  const patient = localStorageRepo.getById(id)
  if (!patient) return null
  
  const updatedPatient = {
    ...patient,
    ...patientData,
    updatedAt: new Date().toISOString(),
  }
  
  return localStorageRepo.update(id, updatedPatient)
}

// Delete patient
const deletePatient = (id: string): boolean => {
  return localStorageRepo.delete(id)
}

// Export service methods
const patientService = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
}

export default patientService
