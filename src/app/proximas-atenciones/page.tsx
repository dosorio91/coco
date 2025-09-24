"use client";
// Colores por centro (igual que en calendario)
const centroColors: Record<string, { bg: string; border: string; text: string }> = {
  'Fénix':    { bg: '#edeaff', border: '#bcb3ff', text: '#635bff' },
  'Bosques':  { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
  'Particular': { bg: '#fef9c3', border: '#fde047', text: '#a16207' },
  'Otro':     { bg: '#ffe5e5', border: '#ff7b7b', text: '#b91c1c' },
};
import { useEffect, useState } from "react";
import { patientFirestoreService } from "@/lib/services/patientFirestoreService";
import { Patient } from "@/lib/db/types";
import { addDays, format, isAfter, isEqual } from "date-fns";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// getTimeOptions eliminado porque no se usa

export default function ProximasAtencionesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [eventosUnicos, setEventosUnicos] = useState<{
    nombre: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const pats = await patientFirestoreService.getAll();
      setPatients(pats);
      try {
        setEventosUnicos(JSON.parse(localStorage.getItem('eventosUnicos') || '[]'));
      } catch { setEventosUnicos([]); }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Consolidar eventos de los próximos 7 días (pacientes y únicos)
  const now = new Date();
  const endDate = addDays(now, 7);
  const eventos: { date: string; start: string; end: string; name: string; tipo: string; centro?: string }[] = [];
  for (const patient of patients) {
    if (patient.schedules && patient.schedules.length > 0) {
      for (const block of patient.schedules) {
        let next = new Date(now);
        for (let i = 0; i < 7; i++) {
          if (days[next.getDay() === 0 ? 6 : next.getDay() - 1] === block.day) {
            const dateStr = format(next, "yyyy-MM-dd");
            if ((isAfter(next, now) || isEqual(next, now)) && (isAfter(endDate, next) || isEqual(endDate, next))) {
              eventos.push({
                date: dateStr,
                start: block.start,
                end: block.end,
                name: `${patient.firstName} ${patient.lastName}`,
                tipo: "Paciente",
                centro: patient.centro
              });
            }
            break;
          }
          next = addDays(next, 1);
        }
      }
    }
  }
  for (const ev of eventosUnicos) {
    if (ev.fecha) {
      const evDate = new Date(ev.fecha + 'T' + (ev.horaInicio || '00:00'));
      if ((isAfter(evDate, now) || isEqual(evDate, now)) && (isAfter(endDate, evDate) || isEqual(endDate, evDate))) {
        eventos.push({
          date: ev.fecha,
          start: ev.horaInicio,
          end: ev.horaFin,
          name: ev.nombre,
          tipo: "Única"
        });
      }
    }
  }
  // Agrupar por día y ordenar
  const eventosFuturos = eventos
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  const agrupados: { [fecha: string]: typeof eventosFuturos } = {};
  for (const ev of eventosFuturos) {
    if (!agrupados[ev.date]) agrupados[ev.date] = [];
    agrupados[ev.date].push(ev);
  }
  const fechasOrdenadas = Object.keys(agrupados).sort();

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-6">
      <div className="bg-white border border-[#e5e7eb] rounded-none p-8 shadow-md mb-10">
        <h2 className="text-2xl font-bold mb-4 text-[#635bff]">Próximas Atenciones</h2>
        {loading ? (
          <div className="text-center text-gray-400 py-8">Cargando...</div>
        ) : fechasOrdenadas.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No hay atenciones próximas</div>
        ) : (
          fechasOrdenadas.map(fecha => (
            <div key={fecha} className="mb-8">
              <div className="text-lg font-bold text-[#635bff] mb-2">{fecha.split('-').reverse().join('/')}</div>
              <div className="overflow-x-auto">
                <table className="min-w-full w-full text-sm text-left mb-2 border-separate border-spacing-0 table-fixed">
                  <colgroup>
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '260px' }} />
                    <col style={{ width: '160px' }} />
                  </colgroup>
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 border-b border-[#e5e7eb]">Hora</th>
                      <th className="px-4 py-3 border-b border-[#e5e7eb]">Paciente</th>
                      <th className="px-4 py-3 border-b border-[#e5e7eb]">Centro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agrupados[fecha].map((e, i) => (
                      <tr key={i} className="border-b border-[#e5e7eb] hover:bg-gray-50">
                        <td className="px-4 py-3 align-top whitespace-nowrap">{e.start} - {e.end}</td>
                        <td className="px-4 py-3 align-top font-semibold text-[#22223b] whitespace-nowrap overflow-hidden text-ellipsis">{e.name}</td>
                        <td className="px-4 py-3 align-top whitespace-nowrap overflow-hidden text-ellipsis">
                          {e.tipo === 'Paciente' && e.centro ? (
                            <span
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{
                                background: centroColors[e.centro]?.bg || '#f3f4f6',
                                borderLeft: `4px solid ${centroColors[e.centro]?.border || '#d1d5db'}`,
                                color: centroColors[e.centro]?.text || '#22223b',
                                display: 'inline-block',
                              }}
                            >
                              {e.centro}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
