"use client";
import { Button } from "@/components/ui/button";
import { Patient, Session } from "@/lib/db/types";
import React from "react";

export function PatientReportPDFButton({ patient, sessions, triggerRef }: { patient: Patient, sessions: Session[], triggerRef?: any }) {
  React.useEffect(() => {
    if (triggerRef && triggerRef.current) {
      triggerRef.current.onclick = handlePrint;
    }
    // eslint-disable-next-line
  }, [triggerRef, sessions]);

  function handlePrint() {
    const violet = "#6c63ff";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>Informe de Paciente</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #22223b; margin: 40px; }
          h1 { color: ${violet}; text-align: center; margin-bottom: 24px; }
          h2 { color: #22223b; border-bottom: 2px solid ${violet}; padding-bottom: 4px; margin-top: 32px; }
          .section { margin-bottom: 24px; }
          .label { color: ${violet}; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #bcb3ff; padding: 8px; font-size: 13px; }
          th { background: #edeaff; color: ${violet}; font-weight: bold; }
          tr:nth-child(even) { background: #f8f8ff; }
        </style>
      </head>
      <body>
        <h1>Informe de Paciente</h1>
        <div class="section">
          <h2>Datos del Paciente</h2>
          <div><span class="label">Nombre:</span> ${patient.firstName} ${patient.lastName}</div>
          <div><span class="label">Edad:</span> ${patient.age}</div>
          <div><span class="label">Tutor:</span> ${patient.tutorName}</div>
          <div><span class="label">Parentesco:</span> ${patient.relationship}</div>
          <div><span class="label">Teléfono:</span> ${patient.phone}</div>
          <div><span class="label">Centro:</span> ${patient.centro}</div>
          <div><span class="label">Estado:</span> ${patient.active ? "Activo" : "Inactivo"}</div>
        </div>
        <div class="section">
          <h2>Motivo de Consulta</h2>
          <div style="color:${violet}; font-size:15px;">${patient.consultation || "-"}</div>
        </div>
        <div class="section">
          <h2>Sesiones</h2>
          <div style="color:#888; font-size:13px; margin-bottom:8px;">
            ${sessions.length === 0 ? 'No hay sesiones en el rango seleccionado.' : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Trabajo Realizado</th>
                <th>Avances/Progreso</th>
                <th>Tareas</th>
              </tr>
            </thead>
            <tbody>
              ${[...sessions]
                .sort((a, b) => {
                  // Parsear fechas dd/mm/aaaa
                  const parse = (s: string): number => {
                    if (!s) return 0;
                    const [d, m, y] = s.split(/[\/\-]/);
                    return new Date(`${y}-${m}-${d}`).getTime();
                  };
                  return parse(b.date) - parse(a.date);
                })
                .map(s => `
                  <tr>
                    <td>${s.date || "-"}</td>
                    <td>${(s.work || "-").replace(/</g, "&lt;")}</td>
                    <td>${(s.progress || "-").replace(/</g, "&lt;")}</td>
                    <td>${(s.tasks || "-").replace(/</g, "&lt;")}</td>
                  </tr>
                `).join("")}
            </tbody>
          </table>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    win.document.close();
  };
  return (
    <Button
      className="bg-[#6c63ff] hover:bg-[#5146e1] text-white font-bold rounded-xl px-6 py-3 text-base shadow transition-colors"
      onClick={handlePrint}
      style={{ display: triggerRef ? 'none' : undefined }}
    >
      Crear Informe General
    </Button>
  );
}
