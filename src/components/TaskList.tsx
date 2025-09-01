import React, { useEffect, useState } from 'react';
import { 
  IonList, 
  IonItem, 
  IonLabel, 
  IonCheckbox, 
  IonIcon, 
  IonItemSliding, 
  IonItemOptions, 
  IonItemOption,
  IonSpinner,
  IonText,
  IonAlert
} from '@ionic/react';
import { trash, create } from 'ionicons/icons';
import { Task, getUserTasks, updateTask, deleteTask } from '../services/dataService';

interface TaskListProps {
  onEditTask: (task: Task) => void;
  refreshTrigger: number;
}

const TaskList: React.FC<TaskListProps> = ({ onEditTask, refreshTrigger }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Cargar tareas del usuario
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
        setError(err.message || 'No se pudieron cargar las tareas');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [refreshTrigger]);

  // Manejar el cambio de estado completado/no completado
  const handleToggleComplete = async (task: Task) => {
    if (!task.id) {
      console.error('Task ID is required for toggle');
      return;
    }

    try {
      const newCompletedState = !task.completed;
      
      // Actualizar en el backend
      await updateTask(task.id, { completed: newCompletedState });
      
      // Actualizar estado local de forma inmutante
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id ? { ...t, completed: newCompletedState } : t
        )
      );
    } catch (err: any) {
      console.error('Error al actualizar tarea:', err);
      // Opcional: Mostrar toast con el error
      setError('Error al actualizar la tarea');
    }
  };

  // Preparar eliminación (mostrar confirmación)
  const handleDeleteRequest = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteAlert(true);
  };

  // Ejecutar eliminación confirmada
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await deleteTask(taskToDelete);
      
      // Actualizar estado local de forma inmutante
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskToDelete));
      
    } catch (err: any) {
      console.error('Error al eliminar tarea:', err);
      setError('Error al eliminar la tarea');
    } finally {
      setTaskToDelete(null);
      setShowDeleteAlert(false);
    }
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    setTaskToDelete(null);
    setShowDeleteAlert(false);
  };

  // Formatear fecha de forma segura
  const formatDate = (fecha?: Date): string => {
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
  };

  // Obtener tarea que se está eliminando (para el alert)
  const getTaskToDeleteTitle = (): string => {
    const task = tasks.find(t => t.id === taskToDelete);
    return task?.titulo || 'esta tarea';
  };

  if (loading) {
    return (
      <div className="ion-text-center ion-padding">
        <IonSpinner name="crescent" />
        <IonText>
          <p>Cargando tareas...</p>
        </IonText>
      </div>
    );
  }

  if (error) {
    return (
      <IonText color="danger" className="ion-padding">
        <p>{error}</p>
      </IonText>
    );
  }

  if (tasks.length === 0) {
    return (
      <IonText className="ion-padding ion-text-center">
        <p>No hay tareas para mostrar.</p>
        <p>¡Crea tu primera tarea!</p>
      </IonText>
    );
  }
  
  return (
    <>
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
                <h2 
                  style={{ 
                    textDecoration: task.completed ? 'line-through' : 'none',
                    opacity: task.completed ? 0.6 : 1,
                    color: task.completed ? 'var(--ion-color-medium)' : 'inherit'
                  }}
                >
                  {task.titulo}
                </h2>
                {task.descripcion && (
                  <p 
                    style={{
                      opacity: task.completed ? 0.6 : 0.8,
                      color: task.completed ? 'var(--ion-color-medium)' : 'var(--ion-color-medium-shade)'
                    }}
                  >
                    {task.descripcion}
                  </p>
                )}
                {task.fecha && (
                  <p 
                    className="ion-text-sm"
                    style={{
                      opacity: task.completed ? 0.6 : 0.7,
                      color: task.completed ? 'var(--ion-color-medium)' : 'var(--ion-color-dark)'
                    }}
                  >
                    📅 Fecha límite: {formatDate(task.fecha)}
                  </p>
                )}
              </IonLabel>
            </IonItem>
            
            <IonItemOptions side="end">
              <IonItemOption 
                color="warning" 
                onClick={() => onEditTask(task)}
                disabled={!task.id}
              >
                <IonIcon slot="icon-only" icon={create} />
              </IonItemOption>
              <IonItemOption 
                color="danger" 
                onClick={() => task.id && handleDeleteRequest(task.id)}
                disabled={!task.id}
              >
                <IonIcon slot="icon-only" icon={trash} />
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        ))}
      </IonList>

      {/* Alert de confirmación para eliminación */}
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={handleCancelDelete}
        header="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar "${getTaskToDeleteTitle()}"?`}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: handleCancelDelete
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: handleConfirmDelete
          }
        ]}
      />
    </>
  );
};

export default TaskList;