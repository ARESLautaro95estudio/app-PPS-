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
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

// Interface Task corregida y consistente
export interface Task {
  id?: string;
  titulo: string;           // Consistente con BD
  descripcion?: string;     // Opcional y consistente con BD  
  completed: boolean;       
  fecha?: Date;            // Cambiado a Date para consistencia
  userId?: string;         // Opcional para nuevas tareas
  createdAt?: Date;        // Opcional para nuevas tareas
}

// Interface para datos como aparecen en Firestore
interface TaskFirestore {
  titulo: string;
  Descripcion?: string;     // Con mayúscula como en BD
  completed: boolean;
  Fecha?: Timestamp;        // Con mayúscula como en BD
  userId: string;
  createdAt: Timestamp;
}

// Colección de tareas
const tareasCollection = collection(db, 'Tareas');

// Función utilitaria para mapear datos de Firestore a Task
const mapFirestoreToTask = (id: string, data: any): Task => {
  return {
    id,
    titulo: data.titulo || '',
    descripcion: data.Descripcion || '', // Mapeo correcto con D mayúscula
    completed: Boolean(data.completed),
    fecha: data.Fecha?.toDate() || undefined, // Mapeo correcto con F mayúscula
    userId: data.userId || '',
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Función utilitaria para mapear Task a formato Firestore
const mapTaskToFirestore = (task: Omit<Task, 'id' | 'userId' | 'createdAt'>): TaskFirestore => {
  if (!auth.currentUser) throw new Error('No hay usuario autenticado');
  
  return {
    titulo: task.titulo,
    Descripcion: task.descripcion || '', // Mapeo a D mayúscula para BD
    completed: Boolean(task.completed),
    Fecha: task.fecha ? Timestamp.fromDate(task.fecha) : undefined, // Mapeo a F mayúscula
    userId: auth.currentUser.uid,
    createdAt: Timestamp.now()
  };
};

// Obtener tareas del usuario actual
export const getUserTasks = async (): Promise<Task[]> => {
  if (!auth.currentUser) throw new Error('No hay usuario autenticado');
  
  try {
    const q = query(
      tareasCollection,
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapFirestoreToTask(doc.id, doc.data()));
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    throw new Error('No se pudieron cargar las tareas');
  }
};

// Crear una nueva tarea
export const createTask = async (task: Omit<Task, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
  if (!auth.currentUser) throw new Error('No hay usuario autenticado');
  
  // Validación
  if (!task.titulo?.trim()) {
    throw new Error('El título es obligatorio');
  }
  
  try {
    const taskToSave = mapTaskToFirestore(task);
    console.log('Guardando tarea:', taskToSave); // Para depuración
    
    const docRef = await addDoc(tareasCollection, taskToSave);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear tarea:', error);
    throw new Error('No se pudo crear la tarea');
  }
};

// Obtener una tarea por ID
export const getTaskById = async (taskId: string): Promise<Task | null> => {
  if (!taskId) {
    throw new Error('ID de tarea requerido');
  }
  
  try {
    const docRef = doc(db, 'Tareas', taskId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return mapFirestoreToTask(docSnap.id, docSnap.data());
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    throw new Error('No se pudo obtener la tarea');
  }
};

// Actualizar una tarea
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  if (!taskId) {
    throw new Error('ID de tarea requerido');
  }
  
  try {
    const taskRef = doc(db, 'Tareas', taskId);
    
    // Mapear los campos a actualizar para que coincidan con los nombres en Firestore
    const updatesToSave: Partial<TaskFirestore> = {};
    
    if (updates.titulo !== undefined) {
      if (!updates.titulo.trim()) {
        throw new Error('El título no puede estar vacío');
      }
      updatesToSave.titulo = updates.titulo;
    }
    
    if (updates.descripcion !== undefined) {
      updatesToSave.Descripcion = updates.descripcion;
    }
    
    if (updates.completed !== undefined) {
      updatesToSave.completed = Boolean(updates.completed);
    }
    
    if (updates.fecha !== undefined) {
      updatesToSave.Fecha = updates.fecha ? Timestamp.fromDate(updates.fecha) : undefined;
    }
    
    await updateDoc(taskRef, updatesToSave);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    throw new Error('No se pudo actualizar la tarea');
  }
};

// Eliminar una tarea
export const deleteTask = async (taskId: string): Promise<void> => {
  if (!taskId) {
    throw new Error('ID de tarea requerido');
  }
  
  try {
    const taskRef = doc(db, 'Tareas', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    throw new Error('No se pudo eliminar la tarea');
  }
};