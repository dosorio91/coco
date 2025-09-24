"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/FirebaseAuthProvider";
import { startOfWeek, addDays, format, addWeeks, subWeeks, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { patientFirestoreService } from "@/lib/services/patientFirestoreService";
import { Patient } from "@/lib/db/types";
import Link from "next/link";

// Días de la semana en español
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function CalendarioPage() {
  const { user } = useAuth();
  const [current, setCurrent] = useState(new Date());
  const weekStart = startOfWeek(current, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const [patients, setPatients] = useState<Patient[]>([]);
  // Nueva atención (evento único)
  const [showAtencion, setShowAtencion] = useState(false);
  const [atencion, setAtencion] = useState({ nombre: '', fecha: '', horaInicio: '', horaFin: '' });
  const [atencionError, setAtencionError] = useState('');
  const [eventosUnicos, setEventosUnicos] = useState<{
    nombre: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
  }[]>(() => {
    if (typeof window !== 'undefined' && user) {
      try {
        return JSON.parse(localStorage.getItem(`eventosUnicos_${user.uid}`) || '[]');
      } catch { return []; }
    }
    return [];
  });

  // Guardar eventos únicos en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem(`eventosUnicos_${user.uid}`, JSON.stringify(eventosUnicos));
    }
  }, [eventosUnicos, user]);

  // Cargar pacientes desde Firestore
  useEffect(() => {
    async function fetchPatients() {
      if (!user) return;
      const data = await patientFirestoreService.getAll(user.uid);
      setPatients(data);
    }
    fetchPatients();
  }, [user]);

  // Consolidar atenciones de todos los pacientes
  const events: {
    date: string;
    start: string;
    end: string;
    name: string;
    id: string;
    tipo: string;
    centro?: string;
  }[] = [];
  for (const patient of patients) {
    if (patient.schedules && patient.schedules.length > 0) {
      for (const block of patient.schedules) {
        const dayIdx = days.indexOf(block.day);
        if (dayIdx !== -1) {
          const date = addDays(weekStart, dayIdx);
          events.push({
            date: format(date, "yyyy-MM-dd"),
            start: block.start,
            end: block.end,
            name: `${patient.firstName} ${patient.lastName}`,
            id: patient.id,
            tipo: 'paciente',
            centro: patient.centro,
          });
        }
      }
    }
  }
// Mapeo de colores por centro
const centroColors: Record<string, { bg: string; border: string; text: string }> = {
  'Fénix':    { bg: '#edeaff', border: '#bcb3ff', text: '#635bff' },
  'Bosques':  { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  'Particular': { bg: '#fef9c3', border: '#fde047', text: '#a16207' },
  'Otro':     { bg: '#ffe5e5', border: '#ff7b7b', text: '#b91c1c' },
};
  // Agregar eventos únicos creados por el usuario
  for (const ev of eventosUnicos) {
    events.push({
      date: ev.fecha,
      start: ev.horaInicio,
      end: ev.horaFin,
      name: ev.nombre,
      id: 'evento-unico',
      tipo: 'unico',
    });
  }

  // Agrupar eventos por día
  const eventsByDay = weekDays.map(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    return {
      date: dateStr,
      events: events
        .filter(e => e.date === dateStr)
        .sort((a, b) => a.start.localeCompare(b.start)),
    };
  });

  // --- Próximas Atenciones eliminada por requerimiento ---
  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-6">
      {/* Header: Month, Year, View Selector, New Activity */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#22223b] mb-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg px-5 py-2 text-base shadow transition-colors mr-2"
            onClick={() => { setShowAtencion(true); setAtencionError(''); }}
          >
            Nueva Atención
          </button>
      {/* Modal Nueva Atención */}
      {showAtencion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowAtencion(false)}>&#10005;</button>
            <h2 className="text-xl font-bold mb-4">Nueva Atención</h2>
            <form onSubmit={e => {
              e.preventDefault();
              setAtencionError('');
              // Validar campos
              if (!atencion.nombre || !atencion.fecha || !atencion.horaInicio || !atencion.horaFin) {
                setAtencionError('Completa todos los campos.');
                return;
              }
              if (atencion.horaFin <= atencion.horaInicio) {
                setAtencionError('La hora de fin debe ser mayor a la de inicio.');
                return;
              }
              // Validar solapamiento con horarios de pacientes
              const fechaStr = atencion.fecha;
              const solapa = events.some(ev =>
                ev.date === fechaStr &&
                ((atencion.horaInicio < ev.end && atencion.horaFin > ev.start))
              );
              if (solapa) {
                setAtencionError('El bloque horario se superpone con otro paciente o evento.');
                return;
              }
              // Guardar evento único
              setEventosUnicos(ev => [...ev, { ...atencion }]);
              setShowAtencion(false);
              setAtencion({ nombre: '', fecha: '', horaInicio: '', horaFin: '' });
            }}>
              <div className="mb-3">
                <label className="block font-medium mb-1">Nombre del Paciente</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={atencion.nombre} onChange={e => setAtencion(a => ({ ...a, nombre: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Fecha de atención</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={atencion.fecha} onChange={e => setAtencion(a => ({ ...a, fecha: e.target.value }))} />
              </div>
              <div className="mb-3 flex gap-2">
                <div className="flex-1">
                  <label className="block font-medium mb-1">Hora Inicio</label>
                  <select className="w-full border rounded px-3 py-2" value={atencion.horaInicio} onChange={e => setAtencion(a => ({ ...a, horaInicio: e.target.value }))}>
                    <option value="">Selecciona...</option>
                    {getTimeOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block font-medium mb-1">Hora Fin</label>
                  <select className="w-full border rounded px-3 py-2" value={atencion.horaFin} onChange={e => setAtencion(a => ({ ...a, horaFin: e.target.value }))}>
                    <option value="">Selecciona...</option>
                    {getTimeOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
              {atencionError && <div className="text-red-600 mb-2 text-sm">{atencionError}</div>}
              <div className="flex justify-end mt-4">
                <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg px-5 py-2">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
          {/* View selector (only Week enabled) */}
          {/* Selector de vista eliminado por requerimiento */}
          <Link
            href="/patients"
            className="bg-[#635bff] hover:bg-[#5146e1] text-white font-semibold rounded-lg px-5 py-2 text-base shadow transition-colors"
            style={{ minWidth: '170px', display: 'inline-block', textAlign: 'center' }}
          >
            Ir a Pacientes
          </Link>
        </div>
      </div>
      {/* Leyenda de colores por centro */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        {Object.entries(centroColors).map(([centro, color]) => (
          <span key={centro} className="flex items-center gap-2 text-xs" style={{ color: color.text }}>
            <span style={{ background: color.bg, borderLeft: `4px solid ${color.border}`, width: 18, height: 18, display: 'inline-block', borderRadius: 6, marginRight: 4 }}></span>
            {centro}
          </span>
        ))}
      </div>
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button className="px-3 py-1 rounded bg-gray-100 border hover:bg-gray-200 text-[#22223b]" onClick={() => setCurrent(subWeeks(current, 1))}>&lt;</button>
        <span className="font-semibold text-lg">
          {format(weekStart, "MMM d", { locale: es })} - {format(addDays(weekStart, 6), "MMM d, yyyy", { locale: es })}
        </span>
        <button className="px-3 py-1 rounded bg-gray-100 border hover:bg-gray-200 text-[#22223b]" onClick={() => setCurrent(addWeeks(current, 1))}>&gt;</button>
      </div>
      {/* Calendar Table */}
      <div className="bg-white shadow-lg border border-[#e5e7eb] overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <th className="p-3 text-xs font-semibold text-[#b0b3c6] text-left w-24 border-b border-[#e5e7eb]">&nbsp;</th>
              {weekDays.map((day, i) => (
                <th key={i} className={`p-3 text-xs font-semibold text-[#b0b3c6] text-center border-b border-[#e5e7eb] ${isToday(day) ? 'text-[#635bff]' : ''}`}>
                  <div className="text-base font-bold text-[#22223b]">{days[i]}</div>
                  <div className="text-xs font-normal">{format(day, "MMM d")}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getTimeOptions().map((hour) => (
              <tr key={hour}>
                <td className="p-3 text-left font-mono text-xs text-[#b0b3c6] bg-[#f8fafc] border-b border-[#e5e7eb]">{hour}</td>
                {eventsByDay.map((day, dIdx) => {
                  const event = day.events.find(e => e.start <= hour && hour < e.end);
                  return (
                    <td key={dIdx} className="p-1 text-center align-top min-w-[140px] border-b border-[#e5e7eb]">
                      {event ? (
                        event.tipo === 'unico' ? (
                          <div className="relative rounded-xl px-3 py-2 text-xs font-semibold text-green-800 shadow-sm flex flex-col items-center justify-center bg-green-100 border-l-4 border-green-400" style={{ boxShadow: '0 2px 8px #22c55e22' }}>
                            <button
                              className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full text-xs font-bold shadow hover:bg-red-700"
                              title="Eliminar evento"
                              onClick={() => setEventosUnicos(ev => ev.filter(eu => !(eu.nombre === event.name && eu.fecha === event.date && eu.horaInicio === event.start && eu.horaFin === event.end)))}
                            >
                              ×
                            </button>
                            <span className="truncate w-full text-sm font-bold">{event.name}</span>
                            <span className="font-normal text-[12px] text-green-800">{event.start} - {event.end}</span>
                          </div>
                        ) : (
                          <Link
                            href={`/patients/${event.id}`}
                            className="rounded-xl px-3 py-2 text-xs font-semibold flex flex-col items-center justify-center cursor-pointer transition-colors"
                            style={{
                              background: centroColors[event.centro || 'Otro']?.bg,
                              borderLeft: `4px solid ${centroColors[event.centro || 'Otro']?.border}`,
                              color: centroColors[event.centro || 'Otro']?.text,
                              boxShadow: `0 2px 8px ${centroColors[event.centro || 'Otro']?.border}22`,
                            }}
                            title={`Ir al perfil de ${event.name}`}
                          >
                            <span className="truncate w-full text-sm font-bold">{event.name}</span>
                            <span className="font-normal text-[12px]" style={{ color: centroColors[event.centro || 'Otro']?.text }}>{event.start} - {event.end}</span>
                            <span className="font-normal text-[11px] mt-1" style={{ color: centroColors[event.centro || 'Otro']?.text }}>{event.centro}</span>
                          </Link>
                        )
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Reutilizar la función auxiliar de horarios
function getTimeOptions(): string[] {
  const options: string[] = [];
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
