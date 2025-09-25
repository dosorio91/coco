export interface PerfilProfesional {
  userId: string;
  fotoURL?: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  prefijo: string; // +56 por defecto
  zonaHoraria: string; // Ej: America/Santiago
  enviarRecordatorios: boolean;
  actualizadoEn: string;
}
