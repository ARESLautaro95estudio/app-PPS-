import React, { useEffect, useState } from 'react';
import { 
  IonButton, 
  IonInput, 
  IonItem, 
  IonLabel, 
  IonTextarea,
  IonDatetime,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonText,
  IonLoading
} from '@ionic/react';
import { Task, createTask, updateTask } from '../services/dataService';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  taskToEdit: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  // Estados del formulario - nombres consistentes con la interface
  const [titulo, setTitulo] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [fecha, setFecha] = useState<string>(''); // String para IonDatetime
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Resetear el formulario cuando se abre o cambia la tarea
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        // Modo edición: llenar con datos existentes
        setTitulo(taskToEdit.titulo);
        setDescripcion(taskToEdit.descripcion || '');
        setFecha(taskToEdit.fecha ? taskToEdit.fecha.toISOString() : '');
      } else {
        // Modo creación: resetear campos
        setTitulo('');
        setDescripcion('');
        setFecha('');
      }
      setError('');
    }
  }, [isOpen, taskToEdit]);

  // Validación del formulario
  const validateForm = (): boolean => {
    if (!titulo.trim()) {
      setError('El título es obligatorio');
      return false;
    }
    return true;
  };

  // Manejar guardado
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const taskData: Omit<Task, 'id' | 'userId' | 'createdAt'> = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || undefined,
        completed: taskToEdit ? taskToEdit.completed : false,
        fecha: fecha ? new Date(fecha) : undefined
      };

      if (taskToEdit && taskToEdit.id) {
        // Actualizar tarea existente
        await updateTask(taskToEdit.id, {
          titulo: taskData.titulo,
          descripcion: taskData.descripcion,
          fecha: taskData.fecha
        });
      } else {
        // Crear nueva tarea
        await createTask(taskData);
      }
      
      onSave(); // Notificar al componente padre
      onClose(); // Cerrar modal
      
    } catch (err: any) {
      console.error('Error al guardar tarea:', err);
      setError(err.message || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  // Handlers con tipos seguros
  const handleTituloChange = (e: CustomEvent) => {
    const value = e.detail.value as string;
    setTitulo(value || '');
    if (error && value.trim()) {
      setError(''); // Limpiar error si se corrige
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
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} disabled={loading}>
              Cancelar
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Título *</IonLabel>
          <IonInput
            value={titulo}
            onIonChange={handleTituloChange}
            placeholder="Ingresa el título de la tarea"
            maxlength={100}
            clearInput
            disabled={loading}
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
            disabled={loading}
          />
        </IonItem>
        
        <IonItem>
          <IonLabel>Fecha límite</IonLabel>
          <IonDatetime
            presentation="date"
            value={fecha}
            onIonChange={handleFechaChange}
            min={new Date().toISOString().split('T')[0]} // No fechas pasadas
            disabled={loading}
            locale="es-ES"
            firstDayOfWeek={1}
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
          {loading ? 'Guardando...' : 'Guardar'}
        </IonButton>
        
        <IonLoading 
          isOpen={loading}
          message={taskToEdit ? "Actualizando tarea..." : "Creando tarea..."}
        />
      </IonContent>
    </IonModal>
  );
};

export default TaskForm;