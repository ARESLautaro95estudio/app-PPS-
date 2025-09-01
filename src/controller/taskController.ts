// controllers/TaskController.ts
// Controlador siguiendo patrón MVC y principios SOLID

import { 
  Task, 
  CreateTaskData, 
  UpdateTaskData,
  TaskValidator,
  ValidationResult 
} from '../types/taskTypes';
import { TaskService } from '../services/taskServices';

/**
 * Controlador para manejar la lógica de negocio de las tareas
 * Siguiendo principios:
 * - Single Responsibility: Solo maneja lógica de tareas
 * - Open/Closed: Extensible sin modificar código existente
 * - Dependency Inversion: Depende de abstracciones (TaskService)
 */
export class TaskController {
  private static instance: TaskController;
  private taskService: TaskService;

  private constructor() {
    // Inyección de dependencia
    this.taskService = TaskService.getInstance();
  }

  /**
   * Singleton pattern para garantizar una sola instancia
   */
  public static getInstance(): TaskController {
    if (!TaskController.instance) {
      TaskController.instance = new TaskController();
    }
    return TaskController.instance;
  }

  /**
   * Obtiene todas las tareas del usuario actual
   */
  public async getAllTasks(): Promise<Task[]> {
    try {
      return await this.taskService.getUserTasks();
    } catch (error: any) {
      console.error('Error en TaskController.getAllTasks:', error);
      throw new Error(error.message || 'Error al obtener las tareas');
    }
  }

  /**
   * Obtiene una tarea específica por ID
   */
  public async getTaskById(taskId: string): Promise<Task | null> {
    if (!taskId?.trim()) {
      throw new Error('ID de tarea requerido');
    }

    try {
      return await this.taskService.getTaskById(taskId);
    } catch (error: any) {
      console.error('Error en TaskController.getTaskById:', error);
      throw new Error(error.message || 'Error al obtener la tarea');
    }
  }

  /**
   * Crea una nueva tarea con validación
   */
  public async createTask(taskData: CreateTaskData): Promise<string> {
    // Validación de datos
    const validation = this.validateTaskData(taskData);
    if (!validation.isValid) {
      throw new Error(validation.errors[0]);
    }

    try {
      return await this.taskService.createTask(taskData);
    } catch (error: any) {
      console.error('Error en TaskController.createTask:', error);
      throw new Error(error.message || 'Error al crear la tarea');
    }
  }

  /**
   * Actualiza una tarea existente con validación
   */
  public async updateTask(taskId: string, updates: UpdateTaskData): Promise<void> {
    if (!taskId?.trim()) {
      throw new Error('ID de tarea requerido');
    }

    // Validación de datos
    const validation = this.validateTaskData(updates);
    if (!validation.isValid) {
      throw new Error(validation.errors[0]);
    }

    try {
      await this.taskService.updateTask(taskId, updates);
    } catch (error: any) {
      console.error('Error en TaskController.updateTask:', error);
      throw new Error(error.message || 'Error al actualizar la tarea');
    }
  }

  /**
   * Elimina una tarea
   */
  public async deleteTask(taskId: string): Promise<void> {
    if (!taskId?.trim()) {
      throw new Error('ID de tarea requerido');
    }

    try {
      await this.taskService.deleteTask(taskId);
    } catch (error: any) {
      console.error('Error en TaskController.deleteTask:', error);
      throw new Error(error.message || 'Error al eliminar la tarea');
    }
  }

  /**
   * Alterna el estado completado de una tarea
   */
  public async toggleTaskCompletion(taskId: string): Promise<void> {
    if (!taskId?.trim()) {
      throw new Error('ID de tarea requerido');
    }

    try {
      // Obtener tarea actual
      const task = await this.taskService.getTaskById(taskId);
      if (!task) {
        throw new Error('Tarea no encontrada');
      }

      // Actualizar estado
      await this.taskService.updateTask(taskId, {
        completed: !task.completed
      });
    } catch (error: any) {
      console.error('Error en TaskController.toggleTaskCompletion:', error);
      throw new Error(error.message || 'Error al cambiar estado de la tarea');
    }
  }

  /**
   * Obtiene tareas filtradas por estado
   */
  public async getTasksByStatus(completed: boolean): Promise<Task[]> {
    try {
      const allTasks = await this.taskService.getUserTasks();
      return allTasks.filter(task => task.completed === completed);
    } catch (error: any) {
      console.error('Error en TaskController.getTasksByStatus:', error);
      throw new Error(error.message || 'Error al filtrar tareas');
    }
  }

  /**
   * Busca tareas por título
   */
  public async searchTasks(searchTerm: string): Promise<Task[]> {
    if (!searchTerm?.trim()) {
      return await this.getAllTasks();
    }

    try {
      const allTasks = await this.taskService.getUserTasks();
      const term = searchTerm.toLowerCase().trim();
      
      return allTasks.filter(task => 
        task.titulo.toLowerCase().includes(term) ||
        (task.descripcion && task.descripcion.toLowerCase().includes(term))
      );
    } catch (error: any) {
      console.error('Error en TaskController.searchTasks:', error);
      throw new Error(error.message || 'Error al buscar tareas');
    }
  }

  /**
   * Obtiene estadísticas de tareas
   */
  public async getTaskStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  }> {
    try {
      const tasks = await this.taskService.getUserTasks();
      const completed = tasks.filter(task => task.completed).length;
      const pending = tasks.length - completed;
      const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

      return {
        total: tasks.length,
        completed,
        pending,
        completionRate: Math.round(completionRate * 100) / 100
      };
    } catch (error: any) {
      console.error('Error en TaskController.getTaskStats:', error);
      throw new Error(error.message || 'Error al obtener estadísticas');
    }
  }

  /**
   * Valida datos de tarea usando el validador
   */
  private validateTaskData(data: CreateTaskData | UpdateTaskData): ValidationResult {
    return TaskValidator.validateTask(data);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  private async ensureAuthenticated(): Promise<void> {
    // Esta lógica podría moverse a un AuthController separado
    // Por ahora, el servicio maneja la autenticación
    // Siguiendo principio de separación de responsabilidades
  }
}

/**
 * Hook personalizado para usar el controlador en componentes React
 * Siguiendo principio de encapsulación y facilidad de uso
 */
export const useTaskController = () => {
  return TaskController.getInstance();
};