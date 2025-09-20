export type ScheduleBlock = {
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  start: string; // formato 'HH:mm'
  end: string;   // formato 'HH:mm'
};

export interface Patient {
  id: string
  firstName: string
  lastName: string
  age: string
  tutorName: string
  relationship: string
  phone: string
  centro: 'Fénix' | 'Bosques' | 'Particular' | 'Otro'
  active: boolean // true = activo, false = inactivo
  consultation?: string
  schedules?: ScheduleBlock[]
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string;
  patientId: string;
  date: string;
  work: string;
  progress: string;
  tasks: string;
  therapy?: string;
  tutorTasks?: string;
  createdAt?: string;
  updatedAt?: string;
}
