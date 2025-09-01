// src/services/alarmService.ts
// Servicio siguiendo principios OOP y KISS para manejar funcionalidades nativas

import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera';
import { AlarmConfig, AlarmResponse, AlarmType, DEFAULT_ALARM_CONFIG } from '../models/Alarm';

export class AlarmService {
  private static instance: AlarmService;
  private isFlashActive = false;
  private flashTimeout?: NodeJS.Timeout;

  // Singleton pattern para evitar múltiples instancias
  public static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  // Método principal siguiendo principio de responsabilidad única
  public async triggerAlarm(config: AlarmConfig = DEFAULT_ALARM_CONFIG): Promise<AlarmResponse> {
    try {
      console.log('Iniciando alarma con configuración:', config);

      const results: AlarmResponse[] = [];

      // Ejecutar según tipo de alarma
      switch (config.type) {
        case AlarmType.VIBRATION:
          results.push(await this.triggerVibration(config.vibrationDuration));
          break;
        
        case AlarmType.FLASH:
          results.push(await this.triggerFlash(config.flashDuration));
          break;
        
        case AlarmType.BOTH:
          // Ejecutar ambos simultáneamente
          const [vibrationResult, flashResult] = await Promise.all([
            this.triggerVibration(config.vibrationDuration),
            this.triggerFlash(config.flashDuration)
          ]);
          results.push(vibrationResult, flashResult);
          break;
        
        default:
          return {
            success: false,
            message: 'Tipo de alarma no válido',
            error: 'INVALID_ALARM_TYPE'
          };
      }

      // Evaluar resultados
      const hasErrors = results.some(r => !r.success);
      
      return {
        success: !hasErrors,
        message: hasErrors 
          ? 'Alarma ejecutada con algunos errores' 
          : '¡Alarma activada correctamente!',
        error: hasErrors ? 'PARTIAL_FAILURE' : undefined
      };

    } catch (error: any) {
      console.error('Error en triggerAlarm:', error);
      return {
        success: false,
        message: 'Error al activar la alarma',
        error: error.message || 'UNKNOWN_ERROR'
      };
    }
  }

  // Método privado para vibración
  private async triggerVibration(duration: number): Promise<AlarmResponse> {
    try {
      await Haptics.vibrate({
        duration: duration
      });

      return {
        success: true,
        message: `Vibración activada por ${duration}ms`
      };
    } catch (error: any) {
      console.error('Error en vibración:', error);
      return {
        success: false,
        message: 'Error al activar vibración',
        error: error.message
      };
    }
  }

  // Método privado para flash
  private async triggerFlash(duration: number): Promise<AlarmResponse> {
    try {
      // Verificar si el flash ya está activo (evitar múltiples activaciones)
      if (this.isFlashActive) {
        return {
          success: false,
          message: 'Flash ya está activo',
          error: 'FLASH_ALREADY_ACTIVE'
        };
      }

      // Activar flash
      await this.enableFlash();
      
      // Programar apagado automático
      this.flashTimeout = setTimeout(async () => {
        await this.disableFlash();
      }, duration);

      return {
        success: true,
        message: `Flash activado por ${duration}ms`
      };
    } catch (error: any) {
      console.error('Error en flash:', error);
      // Asegurar que el flash se apague en caso de error
      await this.disableFlash();
      
      return {
        success: false,
        message: 'Error al activar flash',
        error: error.message
      };
    }
  }

  // Métodos auxiliares para el flash
  private async enableFlash(): Promise<void> {
    try {
      // En Capacitor, necesitamos usar la cámara para acceder al flash
      // Esto es un workaround ya que no hay API directa para el flash
      this.isFlashActive = true;
      
      // Nota: Esta es una implementación simplificada
      // En producción podrías necesitar usar plugins nativos específicos
      console.log('Flash activado');
      
    } catch (error) {
      this.isFlashActive = false;
      throw error;
    }
  }

  private async disableFlash(): Promise<void> {
    try {
      if (this.flashTimeout) {
        clearTimeout(this.flashTimeout);
        this.flashTimeout = undefined;
      }
      
      this.isFlashActive = false;
      console.log('Flash desactivado');
      
    } catch (error) {
      console.error('Error al desactivar flash:', error);
    }
  }

  // Método público para detener manualmente la alarma
  public async stopAlarm(): Promise<AlarmResponse> {
    try {
      await this.disableFlash();
      
      return {
        success: true,
        message: 'Alarma detenida'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Error al detener alarma',
        error: error.message
      };
    }
  }

  // Getter para verificar estado
  public get isActive(): boolean {
    return this.isFlashActive;
  }
}