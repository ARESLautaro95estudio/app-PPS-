import React, { useEffect, useState } from 'react';
import { 
  IonList, 
  IonItem, 
  IonLabel, 
  IonCheckbox, 
  IonButton, 
  IonIcon, 
  IonItemSliding, 
  IonItemOptions, 
  IonItemOption,
  IonSpinner,
  IonText
} from '@ionic/react';
import { trash, create } from 'ionicons/icons';
import { Task, getUserTasks, updateTask, deleteTask } from '../services/dataService';

interface TaskListProps {
  onEditTask: (task: Task) => void;
  refreshTrigger: number;
}

const TaskList: React.FC<TaskListProps> = ({ onEditTask, refreshTrigger }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar tareas
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError('');
        const userTasks = await getUserTasks();
        console.log('Tareas cargadas:', userTasks); // Para depuración
        setTasks(userTasks);
      } catch (err: any) {
        console.error('Error al cargar tareas:', err);
        setError('No se pudieron cargar las tareas');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [refreshTrigger]);

  // Manejar el cambio de estado (completado)
  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask(task.id!, { completed: !task.completed });
      
      // Actualizar estado local
      setTasks(prevTasks => prevTasks.map(t => 
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ));
    } catch (err) {
      console.error('Error al actualizar tarea:', err);
    }
  };

  // Manejar la eliminación
  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      
      // Actualizar estado local
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
    }
  };

  if (loading) {
    return <IonSpinner name="crescent" className="ion-margin" />;
  }

  if (error) {
    return <IonText color="danger">{error}</IonText>;
  }

  if (tasks.length === 0) {
    return <IonText className="ion-padding">No hay tareas para mostrar.</IonText>;
  }
  
  return (
    <IonList>
      {tasks.map(task => (
        <IonItemSliding key={task.id}>
          <IonItem>
            <IonCheckbox 
              slot="start" 
              checked={task.completed}
              onIonChange={() => handleToggleComplete(task)}
            />
            <IonLabel>
              <h2 style={{ 
                textDecoration: task.completed ? 'line-through' : 'none' 
              }}>
                {task.title}
              </h2>
              <p>{task.description}</p>
              {task.dueDate && (
                <p className="ion-text-sm">
                  Fecha límite: {task.dueDate.toLocaleDateString()}
                </p>
              )}
            </IonLabel>
          </IonItem>
          
          <IonItemOptions side="end">
            <IonItemOption color="warning" onClick={() => onEditTask(task)}>
              <IonIcon slot="icon-only" icon={create} />
            </IonItemOption>
            <IonItemOption color="danger" onClick={() => handleDelete(task.id!)}>
              <IonIcon slot="icon-only" icon={trash} />
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      ))}
    </IonList>
  );
};
export default TaskList;