// src/models/Alarm.ts
// Modelo siguiendo principios OOP para definir la estructura de alarma

export interface IAlarm {
  id?: string;
  type: AlarmType;
  duration: number;
  isActive: boolean;
  createdAt: Date;
}

export enum AlarmType {
  VIBRATION = 'vibration',
  FLASH = 'flash',
  BOTH = 'both'
}

export interface AlarmConfig {
  vibrationDuration: number; // en milisegundos
  flashDuration: number;     // en milisegundos
  type: AlarmType;
}

// Configuración por defecto siguiendo requisitos
export const DEFAULT_ALARM_CONFIG: AlarmConfig = {
  vibrationDuration: 200,  // vibración corta
  flashDuration: 3000,     // 3 segundos
  type: AlarmType.BOTH
};

export interface AlarmResponse {
  success: boolean;
  message: string;
  error?: string;
}