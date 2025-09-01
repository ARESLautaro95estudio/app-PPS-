// src/components/AlarmButton.tsx
// Vista del botón de alarma siguiendo principios de componentes reutilizables

import React, { useState } from 'react';
import { 
  IonFab, 
  IonFabButton, 
  IonIcon, 
  IonToast,
  IonSpinner 
} from '@ionic/react';
import { notifications, notificationsOff } from 'ionicons/icons';
import { AlarmController } from '../controllers/alarmController';

interface AlarmButtonProps {
  position?: {
    vertical: 'top' | 'bottom' | 'center';
    horizontal: 'start' | 'end' | 'center';
  };
  className?: string;
}

const AlarmButton: React.FC<AlarmButtonProps> = ({ 
  position = { vertical: 'bottom', horizontal: 'start' },
  className = ''
}) => {
  // Estados del componente
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  
  // Instancia del controlador (inyección de dependencia)
  const alarmController = AlarmController.getInstance();

  // Handler principal del botón - delega al controlador
  const handleAlarmTrigger = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Verificar si ya hay una alarma activa
      if (alarmController.isAlarmActive()) {
        const stopResult = await alarmController.handleStopAlarmRequest();
        showToastMessage(stopResult.message, stopResult.success ? 'warning' : 'danger');
        return;
      }

      // Activar alarma con configuración por defecto
      const result = await alarmController.handleAlarmRequest();
      
      // Mostrar resultado al usuario
      showToastMessage(
        result.message, 
        result.success ? 'success' : 'danger'
      );

    } catch (error: any) {
      console.error('Error en handleAlarmTrigger:', error);
      showToastMessage(
        'Error inesperado al activar alarma', 
        'danger'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper para mostrar mensajes toast (principio DRY)
  const showToastMessage = (message: string, color: 'success' | 'danger' | 'warning'): void => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  // Determinar el icono según el estado
  const getButtonIcon = (): string => {
    if (isLoading) return '';
    return alarmController.isAlarmActive() ? notificationsOff : notifications;
  };

  // Determinar el color según el estado
  const getButtonColor = (): string => {
    if (alarmController.isAlarmActive()) return 'warning';
    return 'danger';
  };

  return (
    <>
      <IonFab 
        vertical={position.vertical} 
        horizontal={position.horizontal} 
        slot="fixed"
        className={className}
      >
        <IonFabButton 
          color={getButtonColor()}
          onClick={handleAlarmTrigger}
          disabled={isLoading}
          title={alarmController.isAlarmActive() ? 'Detener alarma' : 'Activar alarma'}
        >
          {isLoading ? (
            <IonSpinner name="crescent" />
          ) : (
            <IonIcon icon={getButtonIcon()} />
          )}
        </IonFabButton>
      </IonFab>

      {/* Toast para feedback al usuario */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastColor}
        position="top"
        buttons={[
          {
            text: 'OK',
            role: 'cancel',
          },
        ]}
      />
    </>
  );
};

export default AlarmButton;