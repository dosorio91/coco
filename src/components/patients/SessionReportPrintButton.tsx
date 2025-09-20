import React from "react";

interface SessionReportPrintButtonProps {
  patient: {
    nombre: string;
    apellido: string;
    edad?: string | number;
  };
  session: {
    fecha: string;
    trabajoRealizado: string;
    avances: string;
    tareas: string;
  };
}

const institutionalColors = {
  primary: "#1a237e", // azul institucional
  secondary: "#3949ab",
  accent: "#00bcd4",
  background: "#f5f5f5",
  text: "#222",
};

export const SessionReportPrintButton: React.FC<SessionReportPrintButtonProps> = ({ patient, session }) => {
  const handlePrint = () => {
    const win = window.open("", "_blank", "width=800,height=1000");
    if (!win) return;
    const html = `
      <html>
        <head>
          <title>Informe de Sesión</title>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              background: ${institutionalColors.background};
              color: ${institutionalColors.text};
              margin: 0;
              padding: 0;
            }
            .header {
              background: linear-gradient(90deg, ${institutionalColors.primary} 0%, ${institutionalColors.secondary} 100%);
              color: white;
              padding: 32px 0 16px 0;
              text-align: center;
              letter-spacing: 2px;
              font-size: 2rem;
              font-weight: bold;
            }
            .section {
              background: white;
              margin: 32px auto;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(60,60,100,0.08);
              max-width: 700px;
              padding: 32px 40px;
            }
            .section-title {
              color: ${institutionalColors.primary};
              font-size: 1.2rem;
              font-weight: 600;
              margin-bottom: 8px;
              border-left: 4px solid ${institutionalColors.accent};
              padding-left: 8px;
            }
            .section-content {
              margin-bottom: 24px;
              font-size: 1rem;
              line-height: 1.6;
            }
            .justify {
              text-align: justify;
            }
            .label {
              font-weight: 500;
              color: ${institutionalColors.secondary};
            }
            @media print {
              .print-btn { display: none; }
              body { background: white; }
            }
          </style>
        </head>
        <body>
          <div class="header">Informe de Sesión</div>
          <div class="section">
            <div class="section-title">Fecha de la sesión</div>
            <div class="section-content">${session.fecha}</div>
            <div class="section-title">Datos del paciente</div>
            <div class="section-content">
              <span class="label">Nombre:</span> ${patient.nombre} ${patient.apellido}<br/>
              ${patient.edad ? `<span class="label">Edad:</span> ${patient.edad}<br/>` : ""}
            </div>
            <div class="section-title">Fonoaudióloga</div>
            <div class="section-content">Constanza Méndez Laines</div>
            <div class="section-title">Trabajo realizado en la sesión</div>
            <div class="section-content justify">${session.trabajoRealizado || "-"}</div>
            <div class="section-title">Avances / Progresos</div>
            <div class="section-content justify">${session.avances || "-"}</div>
            <div class="section-title">Tareas</div>
            <div class="section-content justify">${session.tareas || "-"}</div>
          </div>
          <div style="text-align:center;margin-bottom:32px;">
            <button class="print-btn" onclick="window.print()" style="background:${institutionalColors.primary};color:white;padding:12px 32px;border:none;border-radius:6px;font-size:1rem;cursor:pointer;">Imprimir o Guardar PDF</button>
          </div>
        </body>
      </html>
    `;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.focus(), 200);
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      style={{
        background: `linear-gradient(90deg, ${institutionalColors.primary} 0%, ${institutionalColors.secondary} 100%)`,
        color: "white",
        border: "none",
        borderRadius: 6,
        padding: "6px 18px",
        fontWeight: 500,
        fontSize: "0.95rem",
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(60,60,100,0.08)",
        marginLeft: 8,
      }}
      title="Generar informe de esta sesión"
    >
      Informe sesión
    </button>
  );
};

export default SessionReportPrintButton;
