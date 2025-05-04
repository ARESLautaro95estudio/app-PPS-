import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonButton,
  IonLoading,
  IonText,
  IonDatetime,
  IonToast
} from '@ionic/react';
import { useHistory, useParams } from 'react-router';
import { Task, createTask, getTaskById, updateTask } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';

interface TaskFormParams {
  id?: string;
}

const TaskFormPage: React.FC = () => {
  const { id } = useParams<TaskFormParams>();
  const history = useHistory();
  const { currentUser } = useAuth();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Cargar tarea si estamos en modo edición
  useEffect(() => {
    const loadTask = async () => {
      if (isEditMode && id) {
        try {
          setInitialLoading(true);
          const task = await getTaskById(id);
          
          if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setDueDate(task.dueDate ? task.dueDate.toISOString() : null);
          } else {
            setError('No se encontró la tarea');
          }
        } catch (err) {
          console.error('Error al cargar tarea:', err);
          setError('Error al cargar la tarea');
        } finally {
          setInitialLoading(false);
        }
      }
    };

    loadTask();
  }, [id, isEditMode]);

  const handleSave = async () => {
    // Validación
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!currentUser) {
      setError('Debes iniciar sesión para guardar tareas');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (isEditMode && id) {
        // Actualizar tarea existente
        await updateTask(id, {
          titulo: title,
          descripcion: description,
          fecha: dueDate ? dueDate : undefined  // Usar el string directamente
        });
        
        setToastMessage('¡Tarea actualizada correctamente!');
      } else {
        // Crear nueva tarea
        await createTask({
          titulo: title,
          descripcion: description,
          completed: false,
          fecha: dueDate ? dueDate : undefined  // Enviar directamente como string
        });
        
        setToastMessage('¡Tarea creada correctamente!');
      }
      
      setShowToast(true);
      
      // Redirigir a la página principal después de un breve retraso
      setTimeout(() => {
        history.push('/home');
      }, 1000);
    } catch (err) {
      console.error('Error al guardar tarea 114:', err);
      setError('Error al guardar la tarea115');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>
            {isEditMode ? 'Editar Tarea' : 'Nueva Tarea'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {initialLoading ? (
          <IonLoading isOpen={true} message="Cargando datos..." />
        ) : (
          <>
            <IonItem>
              <IonLabel position="floating">Título *</IonLabel>
              <IonInput
                value={title}
                onIonChange={e => setTitle(e.detail.value!)}
                placeholder="Ingresa el título de la tarea"
              />
            </IonItem>
            
            <IonItem>
              <IonLabel position="floating">Descripción</IonLabel>
              <IonTextarea
                value={description}
                onIonChange={e => setDescription(e.detail.value!)}
                rows={4}
                placeholder="Describe la tarea (opcional)"
              />
            </IonItem>
            
            <IonItem>
              <IonLabel>Fecha límite</IonLabel>
              <IonDatetime
                displayFormat="DD/MM/YYYY"
                placeholder="Seleccionar fecha (opcional)"
                value={dueDate || ''}
                onIonChange={e => setDueDate(e.detail.value!)}
              />
            </IonItem>
            
            {error && (
              <IonText color="danger" className="ion-padding">
                <p>{error}</p>
              </IonText>
            )}
            
            <IonButton 
              expand="block" 
              className="ion-margin-top"
              onClick={handleSave}
              disabled={loading}
            >
              {isEditMode ? 'Actualizar' : 'Crear'} Tarea
            </IonButton>
            
            <IonButton 
              expand="block" 
              fill="outline"
              className="ion-margin-top"
              onClick={() => history.goBack()}
              disabled={loading}
            >
              Cancelar
            </IonButton>
            
            <IonLoading isOpen={loading} message={isEditMode ? "Actualizando..." : "Creando..."} />
            
            <IonToast
              isOpen={showToast}
              onDidDismiss={() => setShowToast(false)}
              message={toastMessage}
              duration={2000}
              color="success"
              position="top"
            />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default TaskFormPage;