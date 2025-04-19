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
    title: string;
    description: string;
    completed: boolean;
    dueDate?: Date;
    userId: string;
    createdAt: Date;
  }
  
  // Colección de tareas
  const tasksCollection = collection(db, 'tasks');
  
  // Obtener tareas del usuario actual
  export const getUserTasks = async (): Promise<Task[]> => {
    if (!auth.currentUser) throw new Error('No hay usuario autenticado');
    
    const q = query(
      tasksCollection,
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        dueDate: data.dueDate?.toDate(),
      } as Task;
    });
  };
  
  // Crear una nueva tarea
  export const createTask = async (task: Omit<Task, 'id' | 'userId' | 'createdAt'>): Promise<string> => {
    if (!auth.currentUser) throw new Error('No hay usuario autenticado');
    
    const newTask = {
      ...task,
      userId: auth.currentUser.uid,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(tasksCollection, newTask);
    return docRef.id;
  };
  
  // Obtener una tarea por ID
  export const getTaskById = async (taskId: string): Promise<Task | null> => {
    const docRef = doc(db, 'tasks', taskId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        dueDate: data.dueDate?.toDate(),
      } as Task;
    }
    
    return null;
  };
  
  // Actualizar una tarea
  export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, updates);
  };
  
  // Eliminar una tarea
  export const deleteTask = async (taskId: string): Promise<void> => {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  };