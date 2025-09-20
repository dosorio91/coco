"use client"

import { useState, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Patient } from "@/lib/db/types"

interface PatientFormProps {
  patient?: Patient;
  onSave: (patient: Omit<Patient, "id">) => void;
  buttonLabel?: string | ReactNode;
}


export function PatientDialog({ patient, onSave, buttonLabel = "Agregar Paciente" }: PatientFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || "",
    lastName: patient?.lastName || "",
    age: patient?.age || "",
    tutorName: patient?.tutorName || "",
    relationship: patient?.relationship || "",
    phone: patient?.phone || "",
    centro: patient?.centro || "Fénix",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    onSave({
      ...formData,
      active: patient?.active ?? true,
      createdAt: patient?.createdAt ?? now,
      updatedAt: now,
    });
    setOpen(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {typeof buttonLabel === 'string' ? (
          <Button className="rounded-md bg-[#f97316] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#ea580c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f97316]">
            {buttonLabel}
          </Button>
        ) : (
          buttonLabel
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#475569]">{patient ? "Editar Paciente" : "Agregar Paciente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#475569]">Nombre</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#475569]">Apellido</Label>
               <Input
                 id="lastName"
                 name="lastName"
                 value={formData.lastName}
                 onChange={handleChange}
                 placeholder="Opcional"
               />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="centro" className="text-[#475569]">Centro</Label>
            <select
              id="centro"
              name="centro"
              value={formData.centro}
              onChange={handleChange}
              required
              className="w-full rounded-md border-gray-300 focus:border-[#f97316] focus:ring-[#f97316] bg-white py-2 px-3"
            >
              <option value="Fénix">Fénix</option>
              <option value="Bosques">Bosques</option>
              <option value="Particular">Particular</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="age" className="text-[#475569]">Edad</Label>
             <Input
               id="age"
               name="age"
               type="number"
               value={formData.age}
               onChange={handleChange}
               placeholder="Opcional"
             />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutorName" className="text-[#475569]">Nombre del Tutor</Label>
             <Input
               id="tutorName"
               name="tutorName"
               value={formData.tutorName}
               onChange={handleChange}
               placeholder="Opcional"
             />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relationship" className="text-[#475569]">Parentesco</Label>
               <Input
                 id="relationship"
                 name="relationship"
                 value={formData.relationship}
                 onChange={handleChange}
                 placeholder="Opcional"
               />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#475569]">Teléfono</Label>
               <Input
                 id="phone"
                 name="phone"
                 type="tel"
                 value={formData.phone}
                 onChange={handleChange}
                 placeholder="Opcional"
               />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
