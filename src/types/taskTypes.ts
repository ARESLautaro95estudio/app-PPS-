// types/taskTypes.ts
// Siguiendo principios de Single Responsibility y DRY

import { Timestamp } from 'firebase/firestore';

// Tipos principales
export interface Task {
  id?: string;
  titulo: string;
  descripcion?: string;
  completed: boolean;
  fecha?: Date;
  userId?: string;
  createdAt?: Date;
}

// Interface específica para datos en Firestore
export interface TaskFirestore {
  titulo: string;
  Descripcion?: string;     // Con mayúscula como en BD
  completed: boolean;
  Fecha?: Timestamp;        // Con mayúscula como en BD
  userId: string;
  createdAt: Timestamp;
}

// Tipos para operaciones CRUD
export type CreateTaskData = Omit<Task, 'id' | 'userId' | 'createdAt'>;
export type UpdateTaskData = Partial<Pick<Task, 'titulo' | 'descripcion' | 'completed' | 'fecha'>>;

// Tipos para formularios
export interface TaskFormData {
  titulo: string;
  descripcion: string;
  fecha: string; // String para IonDatetime
}

// Tipos para validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Enums para estados
export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ALL = 'all'
}

// Utilidades de validación siguiendo principio KISS
export class TaskValidator {
  static validateTitle(titulo: string): ValidationResult {
    const errors: string[] = [];
    
    if (!titulo || !titulo.trim()) {
      errors.push('El título es obligatorio');
    }
    
    if (titulo.length > 100) {
      errors.push('El título no puede tener más de 100 caracteres');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateDescription(descripcion?: string): ValidationResult {
    const errors: string[] = [];
    
    if (descripcion && descripcion.length > 500) {
      errors.push('La descripción no puede tener más de 500 caracteres');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateDate(fecha?: Date): ValidationResult {
    const errors: string[] = [];
    
    if (fecha && fecha < new Date(new Date().setHours(0, 0, 0, 0))) {
      errors.push('La fecha no puede ser anterior a hoy');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateTask(task: CreateTaskData | UpdateTaskData): ValidationResult {
    const errors: string[] = [];
    
    if ('titulo' in task) {
      const titleValidation = this.validateTitle(task.titulo!);
      errors.push(...titleValidation.errors);
    }
    
    if ('descripcion' in task) {
      const descValidation = this.validateDescription(task.descripcion);
      errors.push(...descValidation.errors);
    }
    
    if ('fecha' in task) {
      const dateValidation = this.validateDate(task.fecha);
      errors.push(...dateValidation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Utilidades de mapeo siguiendo principio de responsabilidad única
export class TaskMapper {
  /**
   * Mapea datos de Firestore a Task
   */
  static fromFirestore(id: string, data: any): Task {
    return {
      id,
      titulo: data.titulo || '',
      descripcion: data.Descripcion || undefined,
      completed: Boolean(data.completed),
      fecha: data.Fecha?.toDate() || undefined,
      userId: data.userId || '',
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }
  
  /**
   * Mapea Task a formato Firestore
   */
  static toFirestore(task: CreateTaskData, userId: string): TaskFirestore {
    return {
      titulo: task.titulo,
      Descripcion: task.descripcion || undefined,
      completed: Boolean(task.completed),
      Fecha: task.fecha ? Timestamp.fromDate(task.fecha) : undefined,
      userId,
      createdAt: Timestamp.now()
    };
  }
  
  /**
   * Mapea actualizaciones a formato Firestore
   */
  static updateToFirestore(updates: UpdateTaskData): Partial<TaskFirestore> {
    const result: Partial<TaskFirestore> = {};
    
    if (updates.titulo !== undefined) {
      result.titulo = updates.titulo;
    }
    
    if (updates.descripcion !== undefined) {
      result.Descripcion = updates.descripcion;
    }
    
    if (updates.completed !== undefined) {
      result.completed = Boolean(updates.completed);
    }
    
    if (updates.fecha !== undefined) {
      result.Fecha = updates.fecha ? Timestamp.fromDate(updates.fecha) : undefined;
    }
    
    return result;
  }
  
  /**
   * Convierte Task a TaskFormData para formularios
   */
  static toFormData(task?: Task): TaskFormData {
    return {
      titulo: task?.titulo || '',
      descripcion: task?.descripcion || '',
      fecha: task?.fecha ? task.fecha.toISOString() : ''
    };
  }
  
  /**
   * Convierte TaskFormData a CreateTaskData
   */
  static fromFormData(formData: TaskFormData): CreateTaskData {
    return {
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      completed: false,
      fecha: formData.fecha ? new Date(formData.fecha) : undefined
    };
  }
}

// Utilidades de formato
export class TaskFormatter {
  /**
   * Formatea fecha de forma segura
   */
  static formatDate(fecha?: Date): string {
    if (!fecha) return '';
    
    try {
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  }
  
  /**
   * Formatea fecha con hora
   */
  static formatDateTime(fecha?: Date): string {
    if (!fecha) return '';
    
    try {
      return fecha.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear fecha y hora:', error);
      return '';
    }
  }
  
  /**
   * Trunca texto a una longitud específica
   */
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
  
  /**
   * Obtiene texto del estado de la tarea
   */
  static getStatusText(completed: boolean): string {
    return completed ? 'Completada' : 'Pendiente';
  }
  
  /**
   * Obtiene color del estado de la tarea
   */
  static getStatusColor(completed: boolean): string {
    return completed ? 'success' : 'warning';
  }
}

// Constantes
export const TASK_CONSTANTS = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  DEFAULT_DATE_FORMAT: 'DD/MM/YYYY',
  COLLECTION_NAME: 'Tareas'
} as const;