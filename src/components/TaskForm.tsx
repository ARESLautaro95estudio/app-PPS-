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
  IonText
} from '@ionic/react';
import { Task, createTask, updateTask } from '../services/dataService';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  taskToEdit: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Resetear el formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        // Modo edición: llenar con datos existentes
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || '');
        setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.toISOString() : null);
      } else {
        // Modo creación: resetear campos
        setTitle('');
        setDescription('');
        setDueDate(null);
      }
      setError('');
    }
  }, [isOpen, taskToEdit]);

  const handleSave = async () => {
    // Validar
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    try {
      if (taskToEdit) {
        // Actualizar existente
        await updateTask(taskToEdit.id!, {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined
        });
      } else {
        // Crear nueva
        await createTask({
          title,
          description,
          completed: false,
          dueDate: dueDate ? new Date(dueDate) : undefined
        });
      }
      
      onSave();
      onClose();
    } catch (err) {
      console.error('Error al guardar tarea:78', err);
      setError('Error al guardar la tarea 79');
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cancelar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Título *</IonLabel>
          <IonInput
            value={title}
            onIonChange={e => setTitle(e.detail.value!)}
          />
        </IonItem>
        
        <IonItem>
          <IonLabel position="floating">Descripción</IonLabel>
          <IonTextarea
            value={description}
            onIonChange={e => setDescription(e.detail.value!)}
            rows={4}
          />
        </IonItem>
        
        <IonItem>
          <IonLabel>Fecha límite</IonLabel>
          <IonDatetime
            displayFormat="DD/MM/YYYY"
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
        >
          Guardar
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default TaskForm;