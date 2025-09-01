// services/TaskService.ts
// Servicio mejorado siguiendo principios SOLID y DRY

import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { 
  Task, 
  CreateTaskData, 
  UpdateTaskData,
  TaskMapper,
  TASK_CONSTANTS
} from '../types/taskTypes';

/**
 * Servicio para operaciones CRUD de tareas
 * Siguiendo principios:
 * - Single Responsibility: Solo maneja datos de tareas
 * - DRY: Evita duplicación de código
 * - KISS: Mantiene métodos simples y claros
 */
export class TaskService {
  private static instance: TaskService;
  private readonly collectionName = TASK_CONSTANTS.COLLECTION_NAME;

  private constructor() {
    // Constructor privado para Singleton
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  /**
   * Obtiene referencia a la colección de tareas
   */
  private getCollection() {
    return collection(db, this.collectionName);
  }

  /**
   * Verifica que el usuario esté autenticado
   */
  private ensureAuthenticated(): void {
    if (!auth.currentUser) {
      throw new Error('Usuario no autenticado');
    }
  }

  /**
   * Obtiene todas las tareas del usuario actual
   */
  public async getUserTasks(): Promise<Task[]> {
    this.ensureAuthenticated();
    
    try {
      const q = query(
        this.getCollection(),
        where('userId', '==', auth.currentUser!.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnap => 
        TaskMapper.fromFirestore(docSnap.id, docSnap.data())
      );
    } catch (error: any) {
      console.error('Error en TaskService.getUserTasks:', error);
      if (error.code === 'permission-denied') {
        throw new Error('No tienes permisos para acceder a las tareas');
      }
      throw new Error('Error al obtener las tareas');
    }
  }

  /**
   * Crea una nueva tarea
   */
  public async createTask(taskData: CreateTaskData): Promise<string> {
    this.ensureAuthenticated();
    
    try {
      const firestoreData = TaskMapper.toFirestore(taskData, auth.currentUser!.uid);
      
      console.log('Creando tarea:', firestoreData); // Debug
      
      const docRef = await addDoc(this.getCollection(), firestoreData);
      return docRef.id;
    } catch (error: any) {
      console.error('Error en TaskService.createTask:', error);
      if (error.code === 'permission-denied') {
        throw new Error('No tienes permisos para crear tareas');
      }
      throw new Error('Error al crear la tarea');
    }
  }

  /**
   * Obtiene una tarea específica por ID
   */
  public async getTaskById(taskId: string): Promise<Task | null> {
    this.ensureAuthenticated();
    
    try {
      const docRef = doc(db, this.collectionName, taskId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      
      // Verificar que la tarea pertenece al usuario actual
      if (data.userId !== auth.currentUser!.uid) {
        throw new Error('No tienes permisos para acceder a esta tarea');
      }
      
      return TaskMapper.fromFirestore(docSnap.id, data);
    } catch (error: any) {
      console.error('Error en TaskService.getTaskById:', error);
      if (error.message.includes('permisos')) {
        throw error; // Re-lanzar errores de permisos
      }
      throw new Error('Error al obtener la tarea');
    }
  }

  /**
   * Actualiza una tarea existente
   */
  public async updateTask(taskId: string, updates: UpdateTaskData): Promise<void> {
    this.ensureAuthenticated();
    
    try {
      // Verificar que la tarea existe y pertenece al usuario
      const existingTask = await this.getTaskById(taskId);
      if (!existingTask) {
        throw new Error('Tarea no encontrada');
      }
      
      const taskRef = doc(db, this.collectionName, taskId);
      const updatesToSave = TaskMapper.updateToFirestore(updates);
      
      console.log('Actualizando tarea:', updatesToSave); // Debug
      
      await updateDoc(taskRef, updatesToSave);
    } catch (error: any) {
      console.error('Error en TaskService.updateTask:', error);
      if (error.message.includes('Tarea no encontrada') || 
          error.message.includes('permisos')) {
        throw error; // Re-lanzar errores específicos
      }
      throw new Error('Error al actualizar la tarea');
    }
  }

  /**
   * Elimina una tarea
   */
  public async deleteTask(taskId: string): Promise<void> {
    this.ensureAuthenticated();
    
    try {
      // Verificar que la tarea existe y pertenece al usuario
      const existingTask = await this.getTaskById(taskId);
      if (!existingTask) {
        throw new Error('Tarea no encontrada');
      }
      
      const taskRef = doc(db, this.collectionName, taskId);
      await deleteDoc(taskRef);
      
      console.log('Tarea eliminada:', taskId); // Debug
    } catch (error: any) {
      console.error('Error en TaskService.deleteTask:', error);
      if (error.message.includes('Tarea no encontrada') || 
          error.message.includes('permisos')) {
        throw error; // Re-lanzar errores específicos
      }
      throw new Error('Error al eliminar la tarea');
    }
  }

  /**
   * Actualiza múltiples tareas de forma batch (para futuras implementaciones)
   */
  public async batchUpdateTasks(updates: Array<{id: string, data: UpdateTaskData}>): Promise<void> {
    this.ensureAuthenticated();
    
    // Esta implementación podría usar writeBatch de Firestore para mejor rendimiento
    // Por ahora, usamos actualización secuencial siguiendo principio KISS
    
    try {
      for (const update of updates) {
        await this.updateTask(update.id, update.data);
      }
    } catch (error: any) {
      console.error('Error en TaskService.batchUpdateTasks:', error);
      throw new Error('Error al actualizar tareas en lote');
    }
  }

  /**
   * Cuenta tareas por estado (para estadísticas)
   */
  public async getTaskCounts(): Promise<{total: number, completed: number, pending: number}> {
    this.ensureAuthenticated();
    
    try {
      const tasks = await this.getUserTasks();
      const completed = tasks.filter(task => task.completed).length;
      const pending = tasks.length - completed;
      
      return {
        total: tasks.length,
        completed,
        pending
      };
    } catch (error: any) {
      console.error('Error en TaskService.getTaskCounts:', error);
      throw new Error('Error al obtener estadísticas de tareas');
    }
  }

  /**
   * Busca tareas que coincidan con un término
   */
  public async searchTasks(searchTerm: string): Promise<Task[]> {
    this.ensureAuthenticated();
    
    try {
      const allTasks = await this.getUserTasks();
      
      if (!searchTerm?.trim()) {
        return allTasks;
      }
      
      const term = searchTerm.toLowerCase().trim();
      return allTasks.filter(task => 
        task.titulo.toLowerCase().includes(term) ||
        (task.descripcion && task.descripcion.toLowerCase().includes(term))
      );
    } catch (error: any) {
      console.error('Error en TaskService.searchTasks:', error);
      throw new Error('Error al buscar tareas');
    }
  }
}