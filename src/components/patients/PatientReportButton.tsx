"use client";
import { Button } from "@/components/ui/button";
import { Patient, Session } from "@/lib/db/types";
import React from "react";

export function PatientReportButton({ patient, sessions }: { patient: Patient, sessions: Session[] }) {
  return (
    <Button
      className="bg-[#6c63ff] hover:bg-[#5146e1] text-white font-bold rounded-xl px-6 py-3 text-base shadow transition-colors"
      onClick={async () => {
        const [{ Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel }, { saveAs }] = await Promise.all([
          import("docx"),
          import("file-saver")
        ]);
        const violet = "#6c63ff";
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  text: "Informe de Paciente",
                  heading: HeadingLevel.TITLE,
                  alignment: "center",
                  spacing: { after: 300 },
                  thematicBreak: true,
                }),
                new Paragraph({
                  text: "Datos del Paciente",
                  heading: HeadingLevel.HEADING_1,
                  spacing: { after: 200 },
                }),
                ...[
                  `Nombre: ${patient.firstName} ${patient.lastName}`,
                  `Edad: ${patient.age}`,
                  `Tutor: ${patient.tutorName}`,
                  `Parentesco: ${patient.relationship}`,
                  `Teléfono: ${patient.phone}`,
                  `Centro: ${patient.centro}`,
                  `Estado: ${patient.active ? "Activo" : "Inactivo"}`,
                ].map(text => new Paragraph({ children: [new TextRun({ text, color: violet })], spacing: { after: 100 } })),
                new Paragraph({
                  text: "Motivo de Consulta",
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                  text: patient.consultation || "-",
                  spacing: { after: 200 },
                  children: [new TextRun({ text: patient.consultation || "-", color: violet })]
                }),
                new Paragraph({
                  text: "Sesiones",
                  heading: HeadingLevel.HEADING_1,
                  spacing: { before: 200, after: 100 },
                }),
                new Table({
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Fecha", bold: true, color: violet })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Trabajo Realizado", bold: true, color: violet })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Avances/Progreso", bold: true, color: violet })] })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tareas", bold: true, color: violet })] })] }),
                      ],
                    }),
                    ...sessions.map(s => new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(s.date)] }),
                        new TableCell({ children: [new Paragraph(s.work)] }),
                        new TableCell({ children: [new Paragraph(s.progress)] }),
                        new TableCell({ children: [new Paragraph(s.tasks)] }),
                      ],
                    })),
                  ],
                  width: { size: 100, type: "pct" },
                }),
              ],
            },
          ],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Informe_${patient.firstName}_${patient.lastName}.docx`);
      }}
    >
      Crear Informe
    </Button>
  );
}
