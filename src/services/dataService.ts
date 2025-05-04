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

// Interfaces para los tipos de datos
export interface Task {
  id?: string;
  titulo: string;       // En español
  descripcion: string;  // En español
  completed: boolean;   
  fecha?: string;       // En español y como string
  userId: string;
  createdAt: Date;
}

// Colección de tareas
const tareasCollection = collection(db, 'Tareas');

// Obtener tareas del usuario actual
export const getUserTasks = async (): Promise<Task[]> => {
  if (!auth.currentUser) throw new Error('No hay usuario autenticado');
  
  const q = query(
    tareasCollection,
    where('userId', '==', auth.currentUser.uid),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.titulo || '', // Exactamente como aparece en Firestore
      description: data.Descripcion || '', // Exactamente como aparece en Firestore (con D mayúscula)
      completed: data.completed || false,
      dueDate: data.Fecha?.toDate() || null, // Exactamente como aparece en Firestore (con F mayúscula)
      userId: data.userId,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Task;
  });
};

// Crear una nueva tarea
export const createTask = async (task: Omit<Task, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
  if (!auth.currentUser) throw new Error('No hay usuario autenticado');
  
  // Crear objeto para guardar en Firestore, mapeando a los nombres exactos en la BD
  const taskToSave = {
    titulo: task.title,                // Mapeo exacto como en la BD
    Descripcion: task.description,     // Mapeo exacto como en la BD (con D mayúscula)
    completed: task.completed,
    Fecha: task.dueDate ? Timestamp.fromDate(task.dueDate) : null, // Mapeo exacto como en la BD (con F mayúscula)
    userId: auth.currentUser.uid,
    createdAt: Timestamp.now()
  };
  
  // Para depuración
  console.log('Guardando tarea:', taskToSave);
  
  const docRef = await addDoc(tareasCollection, taskToSave);
  return docRef.id;
};

// Obtener una tarea por ID
export const getTaskById = async (taskId: string): Promise<Task | null> => {
  const docRef = doc(db, 'Tareas', taskId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.titulo || '',
      description: data.Descripcion || '',
      completed: data.completed || false,
      dueDate: data.Fecha?.toDate() || null,
      userId: data.userId,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Task;
  }
  
  return null;
};

// Actualizar una tarea
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  const taskRef = doc(db, 'Tareas', taskId);
  
  // Mapear los campos a actualizar para que coincidan con los nombres en Firestore
  const updatesToSave: any = {};
  
  if (updates.title !== undefined) {
    updatesToSave.titulo = updates.title;
  }
  
  if (updates.description !== undefined) {
    updatesToSave.Descripcion = updates.description;
  }
  
  if (updates.completed !== undefined) {
    updatesToSave.completed = updates.completed;
  }
  
  if (updates.dueDate !== undefined) {
    updatesToSave.Fecha = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null;
  }
  
  await updateDoc(taskRef, updatesToSave);
};

// Eliminar una tarea
export const deleteTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, 'Tareas', taskId);
  await deleteDoc(taskRef);
};