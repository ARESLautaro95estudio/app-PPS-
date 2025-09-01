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

  // Estados del formulario - nombres consistentes
  const [titulo, setTitulo] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [fecha, setFecha] = useState<string>(''); // Como string para IonDatetime
  
  // Estados de control
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Cargar tarea si estamos en modo edición
  useEffect(() => {
    const loadTask = async () => {
      if (isEditMode && id) {
        try {
          setInitialLoading(true);
          setError('');
          
          const task = await getTaskById(id);
          
          if (task) {
            setTitulo(task.titulo);
            setDescripcion(task.descripcion || '');
            // Convertir fecha a string ISO para IonDatetime
            setFecha(task.fecha ? task.fecha.toISOString() : '');
          } else {
            setError('No se encontró la tarea');
          }
        } catch (err: any) {
          console.error('Error al cargar tarea:', err);
          setError(err.message || 'Error al cargar la tarea');
        } finally {
          setInitialLoading(false);
        }
      }
    };

    loadTask();
  }, [id, isEditMode]);

  // Validación del formulario
  const validateForm = (): boolean => {
    if (!titulo.trim()) {
      setError('El título es obligatorio');
      return false;
    }

    if (!currentUser) {
      setError('Debes iniciar sesión para guardar tareas');
      return false;
    }

    return true;
  };

  // Manejar guardado de tarea
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      
      // Preparar datos de la tarea
      const taskData: Omit<Task, 'id' | 'userId' | 'createdAt'> = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        completed: false, // Nueva tarea siempre empieza como no completada
        fecha: fecha ? new Date(fecha) : undefined
      };
      
      if (isEditMode && id) {
        // Actualizar tarea existente
        await updateTask(id, {
          titulo: taskData.titulo,
          descripcion: taskData.descripcion,
          fecha: taskData.fecha
        });
        
        setToastMessage('¡Tarea actualizada correctamente!');
      } else {
        // Crear nueva tarea
        await createTask(taskData);
        setToastMessage('¡Tarea creada correctamente!');
      }
      
      setShowToast(true);
      
      // Redirigir después de mostrar el toast
      setTimeout(() => {
        history.push('/home');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error al guardar tarea:', err);
      setError(err.message || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los inputs con tipos seguros
  const handleTituloChange = (e: CustomEvent) => {
    const value = e.detail.value as string;
    setTitulo(value || '');
    // Limpiar error si había uno
    if (error && value.trim()) {
      setError('');
    }
  };

  const handleDescripcionChange = (e: CustomEvent) => {
    const value = e.detail.value as string;
    setDescripcion(value || '');
  };

  const handleFechaChange = (e: CustomEvent) => {
    const value = e.detail.value as string;
    setFecha(value || '');
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
                value={titulo}
                onIonChange={handleTituloChange}
                placeholder="Ingresa el título de la tarea"
                maxlength={100}
                clearInput
              />
            </IonItem>
            
            <IonItem>
              <IonLabel position="floating">Descripción</IonLabel>
              <IonTextarea
                value={descripcion}
                onIonChange={handleDescripcionChange}
                rows={4}
                placeholder="Describe la tarea (opcional)"
                maxlength={500}
              />
            </IonItem>
            
            <IonItem>
              <IonLabel>Fecha límite</IonLabel>
              <IonDatetime
                displayFormat="DD/MM/YYYY"
                placeholder="Seleccionar fecha (opcional)"
                value={fecha}
                onIonChange={handleFechaChange}
                min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
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
              disabled={loading || !titulo.trim()}
            >
              {loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')} Tarea
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
            
            <IonLoading 
              isOpen={loading} 
              message={isEditMode ? "Actualizando tarea..." : "Creando tarea..."} 
            />
            
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