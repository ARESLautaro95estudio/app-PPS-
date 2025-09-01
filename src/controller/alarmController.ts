// src/controllers/alarmController.ts
// Controlador MVC para coordinar entre Vista y Modelo/Servicio

import { AlarmService } from '../services/alarmService';
import { AlarmConfig, AlarmResponse, DEFAULT_ALARM_CONFIG } from '../models/Alarm';

export class AlarmController {
  private static instance: AlarmController;
  private alarmService: AlarmService;

  private constructor() {
    // Inyección de dependencia del servicio
    this.alarmService = AlarmService.getInstance();
  }

  // Singleton pattern siguiendo principios OOP
  public static getInstance(): AlarmController {
    if (!AlarmController.instance) {
      AlarmController.instance = new AlarmController();
    }
    return AlarmController.instance;
  }

  // Método principal expuesto a la Vista - Principio de responsabilidad única
  public async handleAlarmRequest(customConfig?: Partial<AlarmConfig>): Promise<AlarmResponse> {
    try {
      // Validar y preparar configuración
      const config = this.prepareConfig(customConfig);
      
      // Validar permisos y capacidades del dispositivo
      const validationResult = await this.validateDeviceCapabilities();
      if (!validationResult.success) {
        return validationResult;
      }

      // Delegar al servicio
      const result = await this.alarmService.triggerAlarm(config);
      
      // Logging para debugging (siguiendo principio de transparencia)
      this.logAlarmExecution(config, result);
      
      return result;

    } catch (error: any) {
      console.error('Error en AlarmController.handleAlarmRequest:', error);
      return {
        success: false,
        message: 'Error interno del controlador',
        error: error.message || 'CONTROLLER_ERROR'
      };
    }
  }

  // Método para detener alarma desde la Vista
  public async handleStopAlarmRequest(): Promise<AlarmResponse> {
    try {
      return await this.alarmService.stopAlarm();
    } catch (error: any) {
      console.error('Error en AlarmController.handleStopAlarmRequest:', error);
      return {
        success: false,
        message: 'Error al detener alarma',
        error: error.message
      };
    }
  }

  // Método para verificar estado desde la Vista
  public isAlarmActive(): boolean {
    return this.alarmService.isActive;
  }

  // Método privado para preparar configuración (principio DRY)
  private prepareConfig(customConfig?: Partial<AlarmConfig>): AlarmConfig {
    return {
      ...DEFAULT_ALARM_CONFIG,
      ...customConfig
    };
  }

  // Validación de capacidades del dispositivo
  private async validateDeviceCapabilities(): Promise<AlarmResponse> {
    try {
      // Verificar que estamos en un dispositivo móvil o que tenga las capacidades necesarias
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      
      if (!isMobile) {
        console.warn('Dispositivo no móvil detectado - algunas funciones pueden no funcionar');
      }

      // Verificar soporte de vibración
      if (!navigator.vibrate && !('vibrate' in navigator)) {
        console.warn('Vibración no soportada en este dispositivo');
      }

      return {
        success: true,
        message: 'Dispositivo válido'
      };

    } catch (error: any) {
      return {
        success: false,
        message: 'Error al validar capacidades del dispositivo',
        error: error.message
      };
    }
  }

  // Método para logging (principio de separación de responsabilidades)
  private logAlarmExecution(config: AlarmConfig, result: AlarmResponse): void {
    const logData = {
      timestamp: new Date().toISOString(),
      config,
      result: {
        success: result.success,
        message: result.message,
        hasError: !!result.error
      }
    };
    
    console.log('Alarma ejecutada:', logData);
  }

  // Método para obtener configuración por defecto (útil para la Vista)
  public getDefaultConfig(): AlarmConfig {
    return { ...DEFAULT_ALARM_CONFIG };
  }

  // Método para validar configuración personalizada
  public validateCustomConfig(config: Partial<AlarmConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.vibrationDuration && (config.vibrationDuration < 50 || config.vibrationDuration > 5000)) {
      errors.push('Duración de vibración debe estar entre 50 y 5000ms');
    }

    if (config.flashDuration && (config.flashDuration < 1000 || config.flashDuration > 10000)) {
      errors.push('Duración de flash debe estar entre 1000 y 10000ms');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}