import { useState } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonInput, 
  IonButton, 
  IonText,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonLoading,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from '../lib/firebase';
import { useHistory } from 'react-router';
import { addRecentUser } from '../services/RecentUsers'; 

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleRegister = async () => {
    // Validaciones
    if (!name || !email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      // Crear usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar el perfil con el nombre
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Añadir a la lista de usuarios recientes
      addRecentUser({
        email: email,
        displayName: name,
        photoURL: null
      });
      
      console.log("Registro exitoso");
      history.push('/home');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email inválido');
      } else {
        setError('Error al registrarse: ' + err.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Registro</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Nombre</IonLabel>
          <IonInput 
            value={name}
            onIonChange={(e) => setName(e.detail.value!)}
          />
        </IonItem>
        
        <IonItem>
          <IonLabel position="floating">Email</IonLabel>
          <IonInput 
            type="email"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
          />
        </IonItem>
        
        <IonItem>
          <IonLabel position="floating">Contraseña</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
          />
        </IonItem>
        
        <IonItem className="ion-margin-bottom">
          <IonLabel position="floating">Confirmar Contraseña</IonLabel>
          <IonInput
            type="password"
            value={confirmPassword}
            onIonChange={(e) => setConfirmPassword(e.detail.value!)}
          />
        </IonItem>
        
        {error && (
          <IonText color="danger" className="ion-padding">
            <p>{error}</p>
          </IonText>
        )}
        
        <IonButton 
          expand="block" 
          onClick={handleRegister}
          className="ion-margin-top"
        >
          Registrarse
        </IonButton>
        
        <IonLoading isOpen={loading} message="Creando cuenta..." />
      </IonContent>
    </IonPage>
  );
};

export default Register;