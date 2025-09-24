"use client"

import { usePatients } from "@/lib/hooks/usePatients"
import PatientsTable from "./patients-table"
import { PatientDialog } from "@/components/patients/patient-dialog"
// import { Button } from "@/components/ui/button" // No se usa
import { Patient } from "@/lib/db/types"

export default function PatientsPage() {
  const { patients, loading, addPatient, editPatient: updatePatient, removePatient: deletePatient } = usePatients()
  // Ahora los pacientes y addPatient están filtrados por usuario autenticado

  const handleAdd = async (patientData: Omit<Patient, "id">) => {
    const now = new Date().toISOString();
    // No generes id aquí, deja que Firestore lo genere y lo devuelva el hook
    await addPatient({
      ...patientData,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  const handleEdit = (id: string, patientData: Omit<Patient, "id">) => {
    updatePatient(id, patientData)
  }

  const handleDelete = (id: string) => {
    deletePatient(id)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-lg">Cargando pacientes...</p>
        </div>
      </div>
    )
  }

  // Separar pacientes activos e inactivos
  const activos = patients.filter(p => p.active !== false)
  const inactivos = patients.filter(p => p.active === false)

  // Cambiar estado activo/inactivo
  const handleToggleActive = (id: string) => {
    const patient = patients.find(p => p.id === id)
    if (!patient) return
    // Si se inactiva, borra todos los horarios
    if (patient.active !== false) {
      handleEdit(id, { ...patient, active: false, schedules: [] })
    } else {
      handleEdit(id, { ...patient, active: true })
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-6 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#22223b] mb-1">Pacientes</h2>
        </div>
        <div className="flex items-center gap-2">
          <PatientDialog
            onSave={handleAdd}
            buttonLabel={
              <button
                className="bg-[#635bff] hover:bg-[#5146e1] text-white font-semibold rounded-xl px-6 py-2 text-base shadow transition-colors flex items-center gap-2"
                type="button"
              >
                <span className="text-xl leading-none">+</span> Nuevo Paciente
              </button>
            }
          />
        </div>
      </div>
      <div className="bg-white shadow-lg border border-[#e5e7eb] rounded-none overflow-x-auto mb-8">
        <h3 className="text-xl font-semibold text-[#635bff] px-6 pt-6 pb-2">Pacientes Activos</h3>
        <div className="px-6 pb-6">
          <PatientsTable
            patients={activos}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        </div>
      </div>
      <div className="bg-white shadow-lg border border-[#e5e7eb] rounded-none overflow-x-auto">
        <h3 className="text-xl font-semibold text-[#b0b3c6] px-6 pt-6 pb-2">Pacientes Inactivos</h3>
        <div className="px-6 pb-6">
          <PatientsTable
            patients={inactivos}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        </div>
      </div>
    </div>
  )
}
