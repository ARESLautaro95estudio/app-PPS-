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
  IonLoading,
  IonItem,
  IonList
} from '@ionic/react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../lib/firebase';
import { useHistory } from 'react-router';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();
 
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
      history.push('/home');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos');
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (id:number) => {
    try {
      setLoading(true);
      setError("");
      switch(id) {
        case 1:
          await signInWithEmailAndPassword(auth, "lauchae1995@gmail.com", "123456");
          history.push('/home');
          break;
        case 2:
          await signInWithEmailAndPassword(auth, "rociopalacios-tzn@hotmail.com", "123456");
          history.push('/home');
          break;
        case 3:
          await signInWithEmailAndPassword(auth, "rociopalaciostzn@gmail.com", "123456");
          history.push('/home');
          break;
      }
    } catch(err : any) {
      // Manejar los errores correctamente
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos');
      } else {
        setError('Error al iniciar sesión rápida');
        console.error(err);
      }
    } finally {
      setLoading(false);  // Asegurarse de desactivar el indicador de carga
    }
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonList>
          <IonItem>
            <IonInput
              type="email"
              placeholder="Email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
          </IonItem>
          
          <IonItem>
            <IonInput
              type="password"
              placeholder="Contraseña"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
            />
          </IonItem>
        </IonList>
        
        {error && (
          <IonText color="danger" style={{textAlign: 'center', display: 'block', margin: '10px 0'}}>
            {error}
          </IonText>
        )}
        <IonButton 
          expand="block" 
          onClick={handleLogin}
          style={{marginTop: '20px'}}
        >
          INGRESAR
        </IonButton>
        <IonButton 
          expand="block" 
          fill="outline"
          routerLink="/register"
          style={{marginTop: '10px'}}
        >
          REGISTRARSE
        </IonButton>
        <IonButton 
          expand="block" 
          fill="outline"
          onClick={() => handleQuickLogin(1)}
          style={{marginTop: '10px'}}
        >
          Lauty
        </IonButton>
        <IonButton 
          expand="block" 
          fill="outline"
          onClick={() => handleQuickLogin(2)}
          style={{marginTop: '10px'}}
        >
          Ro 1 
        </IonButton>
        <IonButton 
          expand="block" 
          fill="outline"
          onClick={() => handleQuickLogin(3)}
          style={{marginTop: '10px'}}
        >
          Ro 2
        </IonButton>
        <IonLoading isOpen={loading} message="Iniciando sesión..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;