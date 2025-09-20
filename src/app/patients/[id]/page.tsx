"use client";


import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
const PatientReportPDFButton = dynamic(() => import("@/components/patients/PatientReportPDFButton").then(mod => mod.PatientReportPDFButton), { ssr: false });
const SessionReportPrintButton = dynamic(() => import("@/components/patients/SessionReportPrintButton").then(mod => mod.SessionReportPrintButton), { ssr: false });
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, SaveIcon, PlusIcon, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Patient, Session } from "@/lib/db/types";
import { patientFirestoreService } from "@/lib/services/patientFirestoreService";
import { sessionFirestoreService } from "@/lib/services/sessionFirestoreService";

export default function PatientProfile() {
  // Crear nueva sesión
  const handleCreateSession = async () => {
    try {
      if (!params?.id) return;
      // Normalizar fecha a dd/mm/aaaa
      let date = sessionForm.date;
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [y, m, d] = date.split('-');
        date = `${d}/${m}/${y}`;
      }
      if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        const [d, m, y] = date.split('-');
        date = `${d}/${m}/${y}`;
      }
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        const now = new Date();
        date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      }
      const sessionToCreate = {
        ...sessionForm,
        patientId: params.id as string,
        date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await sessionFirestoreService.create(sessionToCreate);
      await loadSessions();
      setIsNewSessionOpen(false);
      setSessionForm({
        date: new Date().toISOString().split('T')[0],
        work: '',
        progress: '',
        tasks: ''
      });
      window.alert("Sesión creada correctamente");
    } catch (error) {
      window.alert("Error al crear la sesión");
    }
  };
  const params = useParams();
  // Cargar paciente y sesiones al montar/cambiar id
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (!params?.id) {
        setPatient(null);
        setSchedules([]);
        setLoading(false);
        return;
      }
      const patientData = await patientFirestoreService.getById(params.id as string);
      setPatient(patientData);
      setSchedules(patientData?.schedules || []);
      setLoading(false);
      // Cargar sesiones
      try {
        const sessionData = await sessionFirestoreService.getAll(params.id as string);
        setSessions(sessionData);
      } catch (error) {
        // No bloquear la carga por error de sesiones
      }
    }
    fetchData();
  }, [params?.id]);
  // --- Custom state for schedules and modals ---
  const [schedules, setSchedules] = useState<{ day: string; start: string; end: string }[]>([]);
  const [editandoHorarios, setEditandoHorarios] = useState(false);
  const [topeBlocks, setTopeBlocks] = useState<{ day: string; start: string; end: string; patientName: string }[]>([]);
  const [showTopeModal, setShowTopeModal] = useState(false);
  // --- Helper: getFirstAvailableBlock ---
  async function getFirstAvailableBlock(existingBlocks: { day: string; start: string; end: string }[]): Promise<{ day: string; start: string; end: string }> {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const times = getTimeOptions();
    const allPatients = await patientFirestoreService.getAll();
    let allBlocks: { day: string; start: string; end: string }[] = [];
    for (const p of allPatients) {
      if (!patient || p.id === patient.id) continue;
      if (p.schedules) {
        allBlocks = allBlocks.concat(p.schedules);
      }
    }
    allBlocks = allBlocks.concat(existingBlocks);
    for (const day of days) {
      for (let i = 0; i < times.length - 1; i++) {
        const start = times[i];
        const end = times[i + 1];
        const exists = allBlocks.some(b => b.day === day && b.start === start && b.end === end);
        if (!exists) {
          // No existe, se elimina
        }
      }
    }
    return { day: 'Lunes', start: '08:00', end: '08:15' };
  }

  // --- Helper: findScheduleCollision ---
  async function findScheduleCollision(block: { day: string; start: string; end: string }) {
    if (!block || !block.day || !block.start || !block.end) return null;
    const allPatients = await patientFirestoreService.getAll();
    function toMinutes(t: string) {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    }
  const collisions: { patient: Patient; blocks: { day: string; start: string; end: string }[] }[] = [];
    for (const p of allPatients) {
      if (!patient || p.id === patient.id) continue;
      if (p.schedules) {
        const overlappingBlocks = p.schedules.filter(b => {
          if (b.day !== block.day) return false;
          const startA = toMinutes(block.start);
          const endA = toMinutes(block.end);
          const startB = toMinutes(b.start);
          const endB = toMinutes(b.end);
          return startA < endB && endA > startB;
        });
        if (overlappingBlocks.length > 0) {
          collisions.push({ patient: p, blocks: overlappingBlocks });
        }
      }
    }
    return collisions.length > 0 ? collisions : null;
  }
  // --- State and hooks ---
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    work: '',
    progress: '',
    tasks: ''
  });

  // --- Helper: getTimeOptions ---
  function getTimeOptions() {
    const options = [];
    let hour = 8, min = 0;
    while (hour < 21 || (hour === 20 && min <= 15)) {
      const h = String(hour).padStart(2, '0');
      const m = String(min).padStart(2, '0');
      options.push(`${h}:${m}`);
      min += 15;
      if (min === 60) { hour++; min = 0; }
    }
    return options;
  }

  // --- Data loading helpers ---


  async function loadSessions() {
    try {
      if (!params?.id) return;
      const sessionData = await sessionFirestoreService.getAll(params.id as string);
      setSessions(sessionData);
    } catch (error) {
      window.alert("Error al cargar las sesiones");
    }
  }

  // --- Schedule handlers ---
  async function handleAddSchedule() {
    const newBlock = await getFirstAvailableBlock(schedules);
    setSchedules((s: { day: string; start: string; end: string }[]) => [...s, newBlock]);
    setEditandoHorarios(true);
  }

  function handleRemoveSchedule(idx: number) {
  setSchedules((s: { day: string; start: string; end: string }[], i?: number) => s.filter((_, j) => j !== idx));
  }

  function handleScheduleChange(idx: number, field: 'day' | 'start' | 'end', value: string) {
    setSchedules((s: { day: string; start: string; end: string }[]) =>
      s.map((block, i) => i === idx ? { ...block, [field]: value } : block)
    );
    setEditandoHorarios(true);
  }

  // ...other logic and handlers (handleCreateSession, handleEditSession, etc.)...

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    // Convertir la fecha a dd/mm/aaaa para el input
    let formattedDate = "";
    if (session.date) {
      // Si ya viene en formato yyyy-mm-dd o yyyy/mm/dd
      const isoMatch = session.date.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
      if (isoMatch) {
        formattedDate = `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
      } else {
        // Si viene en dd/mm/aaaa o mm/dd/aaaa, intentar normalizar
        const parts = session.date.split("/");
        if (parts.length === 3) {
          // Si el primer valor es mayor a 12, probablemente es dd/mm/aaaa
          if (parseInt(parts[0]) > 12) {
            formattedDate = `${parts[0]}/${parts[1]}/${parts[2]}`;
          } else {
            // Si el segundo valor es mayor a 12, probablemente es mm/dd/aaaa
            formattedDate = `${parts[1]}/${parts[0]}/${parts[2]}`;
          }
        } else {
          formattedDate = session.date;
        }
      }
    }
    setSessionForm({
      date: formattedDate,
      work: session.work,
      progress: session.progress,
      tasks: session.tasks
    });
    setIsNewSessionOpen(true);
  }

  const handleUpdateSession = async () => {
    try {
      if (!editingSession) return;
      await sessionFirestoreService.update(editingSession.id, {
        ...sessionForm,
        updatedAt: new Date().toISOString(),
      });
      await loadSessions();
      setIsNewSessionOpen(false);
      setEditingSession(null);
      setSessionForm({
        date: new Date().toISOString().split('T')[0],
        work: '',
        progress: '',
        tasks: ''
      });
      window.alert("Sesión actualizada correctamente");
    } catch (error) {
      window.alert("Error al actualizar la sesión");
    }
  }



  const handleSave = async () => {
    if (!patient) return;
    // Check all schedules for collision before saving
    let collision = null;
    if (schedules.length > 0) {
      collision = await findScheduleCollision(schedules[schedules.length - 1]);
    }
    if (Array.isArray(collision) && collision.length > 0) {
      const blocks = collision.flatMap((c) => c.blocks.map((b) => ({ ...b, patientName: `${c.patient.firstName} ${c.patient.lastName}` })));
      setTopeBlocks(blocks);
      setShowTopeModal(true);
      return;
    }
    try {
      const schedulesTyped: import("@/lib/db/types").ScheduleBlock[] = schedules
        .filter((b: { day: string }) => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(b.day))
        .map((b: { day: string; start: string; end: string }) => ({
          ...b,
          day: b.day as 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes',
        }));
      await patientFirestoreService.update(patient.id, { ...patient, schedules: schedulesTyped });
      const updated = await patientFirestoreService.getById(patient.id);
      setPatient(updated);
      window.alert("Datos Guardados");
    } catch (error) {
      window.alert("Error al actualizar los datos");
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="container py-10">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>No se encontró el paciente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }



  return (
    <>
      <div className="max-w-6xl mx-auto py-8 px-2 md:px-6">
        {/* Modal Datos Guardados */}
        <Dialog open={showSavedModal}>
          <DialogContent className="flex flex-col items-center justify-center">
            <DialogHeader>
              <DialogTitle>Datos Guardados</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Header Paciente */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/patients">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <span
            className={`inline-block w-4 h-4 rounded-full border-2 mr-2 ${patient.active !== false ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'}`}
            title={patient.active !== false ? 'Paciente activo' : 'Paciente inactivo'}
            style={{ cursor: 'pointer' }}
            onClick={async () => {
              if (!patient) return;
              if (patient.active !== false) {
                // Inactivar solo si no tiene horarios
                if (Array.isArray(patient.schedules) && patient.schedules.length > 0) {
                  window.alert('Debe eliminar los horarios de atención antes de inactivar al paciente');
                  return;
                }
                await patientFirestoreService.update(patient.id, { active: false, schedules: [] });
                setSchedules([]);
                setPatient({ ...patient, active: false, schedules: [] });
                window.alert('Paciente inactivado');
              } else {
                await patientFirestoreService.update(patient.id, { active: true, schedules: [] });
                setSchedules([]);
                setPatient({ ...patient, active: true, schedules: [] });
                window.alert('Paciente activado');
              }
            }}
          />
          <h1 className="text-3xl font-bold text-[#22223b]">{patient.firstName} {patient.lastName}</h1>
          <div className="flex-1 flex justify-end">
            <Button 
              onClick={handleSave}
              className="rounded-md bg-green-200 text-green-900 shadow-sm hover:bg-green-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400 border-0"
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          {/* Modal Tope Horario */}
          <Dialog open={showTopeModal} onOpenChange={setShowTopeModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tope Horario</DialogTitle>
                <DialogDescription>
                  {topeBlocks.length > 0 && (
                    <>
                      <span className="mb-1 block">Pacientes en conflicto: <span className="font-semibold">{topeBlocks.map(b => b.patientName).filter((v, i, a) => a.indexOf(v) === i).join(', ')}</span></span>
                      <span className="block">{topeBlocks.length === 1 ? 'Bloque en conflicto:' : 'Bloques en conflicto:'}</span>
                      <ul className="list-disc ml-6 mt-1">
                        {topeBlocks.map((b, i) => (
                          <li key={i}>{b.day} {b.start} - {b.end} <span className="text-xs text-gray-500">({b.patientName})</span></li>
                        ))}
                      </ul>
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end mt-4">
                <Button onClick={() => { setShowTopeModal(false); setTopeBlocks([]); }}>Cerrar</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Datos del Paciente */}
          <div className="bg-white border border-[#e5e7eb] rounded-none p-8 shadow-md h-full flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-[#635bff]">Datos del Paciente</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-[#22223b] mb-1">Apellido Paciente</label>
                <input type="text" className="w-full rounded-md border border-[#e5e7eb] px-3 py-2" value={patient.lastName} onChange={(e) => { setPatient({ ...patient, lastName: e.target.value }); }} placeholder="Opcional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#22223b] mb-1">Edad</label>
                <input type="number" className="w-full rounded-md border border-[#e5e7eb] px-3 py-2" value={patient.age} onChange={(e) => { setPatient({ ...patient, age: e.target.value }); }} placeholder="Opcional" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#22223b] mb-1">Tutor</label>
                <input type="text" className="w-full rounded-md border border-[#e5e7eb] px-3 py-2" value={patient.tutorName} onChange={(e) => { setPatient({ ...patient, tutorName: e.target.value }); }} placeholder="Opcional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#22223b] mb-1">Relación</label>
                <input type="text" className="w-full rounded-md border border-[#e5e7eb] px-3 py-2" value={patient.relationship} onChange={(e) => { setPatient({ ...patient, relationship: e.target.value }); }} placeholder="Opcional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#22223b] mb-1">Teléfono</label>
                <input type="text" className="w-full rounded-md border border-[#e5e7eb] px-3 py-2" value={patient.phone} onChange={(e) => { setPatient({ ...patient, phone: e.target.value }); }} placeholder="Opcional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#22223b] mb-1">Centro</label>
                <select className="w-full rounded-md border border-[#e5e7eb] px-3 py-2 bg-white focus:border-[#635bff] focus:ring-[#635bff]" value={patient.centro} onChange={e => { setPatient({ ...patient, centro: e.target.value as Patient["centro"] }); }} required>
                  <option value="Fénix">Fénix</option>
                  <option value="Bosques">Bosques</option>
                  <option value="Particular">Particular</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Horarios de Atención */}
          <div className="bg-white border border-[#e5e7eb] rounded-none p-8 shadow-md h-full flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-[#635bff]">Horarios de Atención</h2>
            <div className="space-y-4">
              {patient.active !== false && schedules.length > 0 && schedules.map((block, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Select value={block.day} onChange={e => handleScheduleChange(idx, 'day', e.target.value)} className="w-32" disabled={!editandoHorarios}>
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </Select>
                  <Select value={block.start} onChange={e => handleScheduleChange(idx, 'start', e.target.value)} className="w-28" disabled={!editandoHorarios}>
                    {getTimeOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                  <span>a</span>
                  <Select value={block.end} onChange={e => handleScheduleChange(idx, 'end', e.target.value)} className="w-28" disabled={!editandoHorarios}>
                    {getTimeOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveSchedule(idx)} title="Eliminar bloque" className="ml-2" disabled={!editandoHorarios}>-</Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => { handleAddSchedule(); }} disabled={editandoHorarios}>Agregar bloque</Button>
              {editandoHorarios && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    const collision = await findScheduleCollision(schedules[schedules.length - 1]);
                    if (Array.isArray(collision) && collision.length > 0) {
                      // Construir arrays de nombres y bloques
                      const names = collision.map((c: { patient: Patient; blocks: { day: string; start: string; end: string }[] }) => `${c.patient.firstName} ${c.patient.lastName}`);
                      const blocks = collision.flatMap((c: { patient: Patient; blocks: { day: string; start: string; end: string }[] }) => c.blocks.map((b) => ({ ...b, patientName: `${c.patient.firstName} ${c.patient.lastName}` })));
                      setTopeBlocks(blocks);
                      setShowTopeModal(true);
                      // No permite terminar edición
                      return;
                    }
                    // Guardar los bloques horarios en el paciente
                    if (patient) {
                      try {
                        const schedulesTyped: import("@/lib/db/types").ScheduleBlock[] = schedules
                          .filter((b: { day: string }) => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].includes(b.day))
                          .map((b: { day: string; start: string; end: string }) => ({
                            ...b,
                            day: b.day as 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes',
                          }));
                        await patientFirestoreService.update(patient.id, { schedules: schedulesTyped });
                        // Recargar paciente desde Firestore para asegurar datos frescos
                        const updatedPatient = await patientFirestoreService.getById(patient.id);
                        setPatient(updatedPatient);
                        setSchedules(updatedPatient?.schedules || []);
                        window.alert("Horarios guardados correctamente");
                      } catch (error) {
                        window.alert("Error al guardar los horarios");
                        return;
                      }
                    }
                    setEditandoHorarios(false);
                  }}
                >
                  Terminar edición
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Motivo de Consulta */}
        <div className="bg-white border border-[#e5e7eb] rounded-none p-8 shadow-md mt-8">
          <h2 className="text-xl font-semibold mb-4 text-[#635bff]">Motivo de Consulta</h2>
          <textarea className="w-full min-h-[200px] rounded-md border border-[#e5e7eb] px-3 py-2 resize-none bg-white placeholder:text-[#b0b3c6] focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/20" placeholder="Ingrese el motivo de consulta..." value={patient.consultation || ""} onChange={(e) => { setPatient({ ...patient, consultation: e.target.value }); }} />
        </div>

        {/* Sesiones */}
        <div className="mt-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">Sesiones</h2>
              <Button
                className="rounded-md bg-[#635bff] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#5146d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] border-0 ml-4"
                onClick={() => {
                  setEditingSession(null)
                  const today = new Date();
                  const day = String(today.getDate()).padStart(2, '0');
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const year = today.getFullYear();
                  setSessionForm({
                    date: `${day}/${month}/${year}`,
                    work: '',
                    progress: '',
                    tasks: ''
                  })
                  setIsNewSessionOpen(true)
                }}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nueva Sesión
              </Button>
            </div>

            {/* Tabla de sesiones */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Nº</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Detalles Sesión</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sessions]
                    .sort((a, b) => {
                      // Parsear fechas dd/mm/aaaa
                      const parse = (s: string) => {
                        if (!s) return 0;
                        const [d, m, y] = s.split(/[\/\-]/);
                        return new Date(`${y}-${m}-${d}`).getTime();
                      };
                      return parse(b.date) - parse(a.date);
                    })
                    .map((session, index) => (
                      <tr key={session.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 align-top">{sessions.length - index}</td>
                        <td className="px-4 py-3 align-top">{session.date}</td>
                        <td className="px-4 py-3 align-top" style={{ textAlign: 'justify' }}>{session.work}</td>
                        <td className="px-4 py-3 align-top text-right flex gap-2 justify-end items-start">
                          <Button
                            size="sm"
                            className="bg-[#edeaff] hover:bg-[#d1cfff] text-[#635bff] border-0"
                            title="Ver sesión"
                            onClick={() => handleEditSession(session)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Botón de eliminar sesión eliminado por limpieza de lint */}
                          {/* Botón para informe individual de sesión */}
                          {patient && (
                            <SessionReportPrintButton
                              patient={{
                                nombre: patient.firstName,
                                apellido: patient.lastName,
                                edad: patient.age || ""
                              }}
                              session={{
                                fecha: session.date,
                                trabajoRealizado: session.work,
                                avances: session.progress,
                                tareas: session.tasks
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal de Nueva/Editar Sesión */}
        <Dialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSession ? 'Editar Sesión' : 'Nueva Sesión'}</DialogTitle>
              <DialogDescription>
                Complete los datos de la sesión. Solo la fecha es obligatoria.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Fecha</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="text"
                    pattern="\\d{2}/\\d{2}/\\d{4}"
                    placeholder="dd/mm/aaaa"
                    autoComplete="off"
                    value={sessionForm.date || ''}
                    onChange={(e) => {
                      // Convertir dd/mm/aaaa a yyyy-mm-dd para guardar internamente
                      let val = e.target.value;
                      // Si el navegador autocompleta en mm/dd/yyyy, convertir a dd/mm/yyyy
                      if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
                        const [a, b, c] = val.split('/');
                        // Si el primer valor es mayor a 12, probablemente es mm/dd/yyyy
                        if (parseInt(a) > 12) {
                          val = `${b}/${a}/${c}`;
                        }
                      }
                      const [d, m, y] = val.split('/');
                      if (d && m && y && d.length === 2 && m.length === 2 && y.length === 4) {
                        const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                        setSessionForm({ ...sessionForm, date: iso });
                      } else if (val === '') {
                        setSessionForm({ ...sessionForm, date: '' });
                      } else {
                        setSessionForm({ ...sessionForm, date: val });
                      }
                    }}
                    required
                    inputMode="numeric"
                    maxLength={10}
                  />
                  {/* Eliminado: sugerencia de fecha a la derecha, solo se muestra en el input */}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="work">Trabajo Realizado</Label>
                <Textarea
                  id="work"
                  value={sessionForm.work}
                  onChange={(e) => setSessionForm({ ...sessionForm, work: e.target.value })}
                  placeholder="Describa el trabajo realizado en esta sesión..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="progress">Avances / Progreso</Label>
                <Textarea
                  id="progress"
                  value={sessionForm.progress}
                  onChange={(e) => setSessionForm({ ...sessionForm, progress: e.target.value })}
                  placeholder="Describa los avances observados..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tasks">Tareas</Label>
                <Textarea
                  id="tasks"
                  value={sessionForm.tasks}
                  onChange={(e) => setSessionForm({ ...sessionForm, tasks: e.target.value })}
                  placeholder="Describa las tareas asignadas..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewSessionOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingSession ? handleUpdateSession : handleCreateSession}>
                {editingSession ? 'Guardar Cambios' : 'Crear Sesión'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    {/* Botón Crear Informe General con selector de fechas */}
    <DateRangeReport patient={patient} sessions={sessions} />
  </>);
}

// --- Componente auxiliar para selector de fechas e informe ---
// import type { Patient, Session } from "@/lib/db/types"; // Ya importados arriba
function DateRangeReport({ patient, sessions }: { patient: Patient, sessions: Session[] }) {
  const [open, setOpen] = React.useState(false);
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");
  const [filtered, setFiltered] = React.useState<Session[]>(sessions);
  const pdfBtnRef = useRef<HTMLButtonElement>(null!);

  const handleGenerate = () => {
    if (!start || !end) return;
    // Filtrar sesiones por rango (asume formato yyyy-mm-dd o dd/mm/yyyy)
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    setFiltered(
      sessions.filter(s => {
        const d = parseDate(s.date);
        return d >= startDate && d <= endDate;
      })
    );
    setOpen(false);
    setTimeout(() => {
      if (pdfBtnRef.current) pdfBtnRef.current.click();
    }, 100);
  };

  // Utilidad para parsear fechas en formatos comunes
  function parseDate(str: string) {
    if (!str) return new Date("1900-01-01");
    if (/\d{4}-\d{2}-\d{2}/.test(str)) return new Date(str);
    if (/\d{2}\/\d{2}\/\d{4}/.test(str)) {
      const [d, m, y] = str.split("/");
      return new Date(`${y}-${m}-${d}`);
    }
    return new Date(str);
  }

  return (
    <>
      <div className="flex justify-center mt-16 mb-8 w-full">
        <Button className="bg-[#6c63ff] hover:bg-[#5146e1] text-white font-bold rounded-xl px-6 py-3 text-base shadow transition-colors" onClick={() => setOpen(true)}>
          Crear Informe General
        </Button>
        {/* Botón oculto para disparar el PDF con sesiones filtradas */}
        <span style={{ display: 'none' }}>
          <button ref={pdfBtnRef} onClick={() => {}} />
          <PatientReportPDFButton
            patient={patient}
            sessions={filtered}
            triggerRef={pdfBtnRef}
          />
        </span>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecciona el rango de fechas</DialogTitle>
            <DialogDescription>Solo se incluirán las sesiones entre la fecha de inicio y fin (inclusive).</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <label className="font-medium">Fecha inicio
              <input type="date" className="border rounded px-2 py-1 ml-2" value={start} onChange={e => setStart(e.target.value)} />
            </label>
            <label className="font-medium">Fecha fin
              <input type="date" className="border rounded px-2 py-1 ml-2" value={end} onChange={e => setEnd(e.target.value)} />
            </label>
          </div>
          <DialogFooter>
            <Button onClick={handleGenerate} disabled={!start || !end}>Generar Informe</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
