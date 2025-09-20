"use client";
import { Patient } from "@/lib/db/types";
import { PatientDialog } from "@/components/patients/patient-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PenIcon, TrashIcon, UserIcon, ToggleLeft } from "lucide-react";

interface PatientsTableProps {
  patients: Patient[];
  onAdd: (patient: Omit<Patient, "id">) => void;
  onEdit: (id: string, patient: Omit<Patient, "id">) => void;
  onDelete: (id: string) => void;
  onToggleActive?: (id: string) => void;
}

export default function PatientsTable({ patients, onEdit, onDelete, onToggleActive }: PatientsTableProps) {
  return (
    <div className="space-y-4">
      <Table className="border border-[#e5e7eb] rounded-none overflow-hidden shadow-md">
        <TableHeader className="bg-[#f8fafc] border-b border-[#e5e7eb]">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[#b0b3c6] font-semibold py-4">Nombre</TableHead>
            <TableHead className="text-[#b0b3c6] font-semibold py-4">Apellido</TableHead>
            <TableHead className="text-[#b0b3c6] font-semibold py-4">Edad</TableHead>
            <TableHead className="text-[#b0b3c6] font-semibold py-4">Tutor</TableHead>
            <TableHead className="text-[#b0b3c6] font-semibold py-4">Parentesco</TableHead>
            <TableHead className="text-[#b0b3c6] font-semibold py-4">Centro</TableHead>
            <TableHead className="text-[#b0b3c6] font-semibold py-4">Teléfono</TableHead>
            <TableHead className="text-[#b0b3c6] font-semibold py-4 w-[180px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                No hay pacientes registrados
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient) => (
              <TableRow key={patient.id} className="hover:bg-[#f8fafc] transition-colors border-b border-[#e5e7eb]">
                <TableCell className="py-3">{patient.firstName}</TableCell>
                <TableCell className="py-3">{patient.lastName}</TableCell>
                <TableCell className="py-3">{patient.age}</TableCell>
                <TableCell className="py-3">{patient.tutorName}</TableCell>
                <TableCell className="py-3">{patient.relationship}</TableCell>
                <TableCell className="py-3">{patient.centro}</TableCell>
                <TableCell className="py-3">{patient.phone}</TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/patients/${patient.id}`}>
                      <Button
                        size="sm"
                        className="border-0 shadow-md rounded-xl px-0 py-0"
                        style={{
                          background: 'rgba(120, 120, 255, 0.08)',
                          boxShadow: '0 4px 16px #b3b3ff33',
                          borderRadius: '14px',
                          minWidth: '38px',
                          minHeight: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                      >
                        <UserIcon className="h-5 w-5 text-[#6c63ff]" />
                      </Button>
                    </Link>
                    <PatientDialog
                      patient={patient}
                      onSave={(data) => onEdit(patient.id, data)}
                      buttonLabel={
                        <Button
                          size="sm"
                          className="border-0 shadow-md rounded-xl px-0 py-0"
                          style={{
                            background: 'rgba(120, 120, 255, 0.08)',
                            boxShadow: '0 4px 16px #b3b3ff33',
                            borderRadius: '14px',
                            minWidth: '38px',
                            minHeight: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                          }}
                        >
                          <PenIcon className="h-5 w-5 text-[#6c63ff]" />
                        </Button>
                      }
                    />
                    <Button
                      size="sm"
                      className="border-0 shadow-md rounded-xl px-0 py-0"
                      style={{
                        background: 'rgba(120, 120, 255, 0.08)',
                        boxShadow: '0 4px 16px #b3b3ff33',
                        borderRadius: '14px',
                        minWidth: '38px',
                        minHeight: '38px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                      }}
                      onClick={() => onDelete(patient.id)}
                    >
                      <TrashIcon className="h-5 w-5 text-[#6c63ff]" />
                    </Button>
                    {onToggleActive && (
                      <Button
                        size="sm"
                        className="border-0 shadow-md rounded-xl px-0 py-0"
                        style={{
                          background: patient.active !== false
                            ? 'rgba(0, 255, 120, 0.10)'
                            : 'rgba(255, 0, 80, 0.10)',
                          boxShadow: patient.active !== false
                            ? '0 4px 16px #aaffcc33'
                            : '0 4px 16px #ffb3c633',
                          borderRadius: '14px',
                          minWidth: '38px',
                          minHeight: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                        title={patient.active !== false ? "Inactivar" : "Activar"}
                        onClick={() => onToggleActive(patient.id)}
                      >
                        <ToggleLeft className={patient.active !== false
                          ? "h-5 w-5 text-[#22c55e]"
                          : "h-5 w-5 text-[#f43f5e]"
                        } />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
