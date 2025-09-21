import { Patient, Session } from "@/lib/db/types";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel } from "docx";

export async function generatePatientReport(patient: Patient, sessions: Session[]) {
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
            style: "TitleStyle"
          }),
          new Paragraph({
            text: "Datos del Paciente",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
            style: "SectionTitle"
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
            style: "SectionTitle"
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
            style: "SectionTitle"
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
}
