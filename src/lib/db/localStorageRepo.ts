import { Patient } from "./types"

const PATIENTS_KEY = "patients"

function getPatients(): Patient[] {
  if (typeof window === "undefined") return []
  const patientsJson = localStorage.getItem(PATIENTS_KEY)
  return patientsJson ? JSON.parse(patientsJson) : []
}

function createPatient(patientData: Omit<Patient, "id">): Patient {
  const patient: Patient = {
    ...patientData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  const patients = getPatients()
  patients.push(patient)
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients))
  return patient
}

function updatePatient(id: string, patientData: Partial<Patient>): Patient | null {
  const patients = getPatients();
  const index = patients.findIndex((p) => p.id === id);
  if (index !== -1) {
    // Si schedules está presente y es un arreglo vacío, bórralo realmente
  let newSchedules: Patient["schedules"] = [];
    if (Array.isArray(patientData.schedules)) {
      newSchedules = patientData.schedules;
    } else if (Array.isArray(patients[index].schedules)) {
      newSchedules = patients[index].schedules;
    }
    // Si se está inactivando o schedules es [], elimina cualquier rastro anterior
    let updatedPatient: Patient = {
      ...patients[index],
      ...patientData,
      updatedAt: new Date().toISOString(),
    };
    if (Array.isArray(patientData.schedules) && patientData.schedules.length === 0) {
      updatedPatient.schedules = [];
    } else if (Array.isArray(newSchedules)) {
      updatedPatient.schedules = newSchedules;
    } else {
      delete updatedPatient.schedules;
    }
    patients[index] = updatedPatient;
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
    return updatedPatient;
  }
  return null;
}

function deletePatient(id: string): boolean {
  const patients = getPatients()
  const filteredPatients = patients.filter((p) => p.id !== id)
  if (filteredPatients.length < patients.length) {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(filteredPatients))
    return true
  }
  return false
}

const localStorageRepo = {
  getAll: getPatients,
  getById: (id: string) => {
    const patients = getPatients()
    return patients.find(p => p.id === id) || null
  },
  create: createPatient,
  update: updatePatient,
  delete: deletePatient
}

export default localStorageRepo
