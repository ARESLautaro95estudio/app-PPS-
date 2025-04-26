import { useState, useEffect } from 'react';
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
  IonList,
  IonAvatar,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../lib/firebase';
import { useHistory } from 'react-router';
import  { getRecentUsers, addRecentUser } from '../services/RecentUsers';
import { person, closeCircle } from 'ionicons/icons';

interface RecentUser {
  email: string;
  displayName?: string;
  photoURL?: string;
  lastLogin: number;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<RecentUser | null>(null);
  const history = useHistory();

  // Cargar usuarios recientes al iniciar
  useEffect(() => {
    const users = getRecentUsers();
    setRecentUsers(users);
  }, []);

  const handleLogin = async () => {
    // Validación básica
    const emailToUse = selectedUser ? selectedUser.email : email;
    
    if (!emailToUse || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
      
      // Registrar este inicio de sesión en el historial
      addRecentUser({
        email: emailToUse,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      });
      
      console.log("Inicio de sesión exitoso");
      history.push('/home'); // Redirigir al home tras login exitoso
    } catch (err: any) {
      // Manejar diferentes tipos de errores
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Inténtalo más tarde');
      } else {
        setError('Error al iniciar sesión: ' + err.message);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectRecentUser = (user: RecentUser) => {
    setSelectedUser(user);
    setEmail(user.email);
    // Enfocar el campo de contraseña
    const passwordInput = document.querySelector('ion-input[type="password"]') as HTMLIonInputElement;
    if (passwordInput) {
      setTimeout(() => passwordInput.setFocus(), 100);
    }
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
    setEmail('');
    // Enfocar el campo de email
    const emailInput = document.querySelector('ion-input[type="email"]') as HTMLIonInputElement;
    if (emailInput) {
      setTimeout(() => emailInput.setFocus(), 100);
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
        {/* Sección de usuarios recientes */}
        {recentUsers.length > 0 && !selectedUser && (
          <div className="ion-margin-bottom">
            <IonText>
              <h4>Iniciar sesión rápido</h4>
            </IonText>
            <IonGrid>
              <IonRow>
                {recentUsers.map((user, index) => (
                  <IonCol size="12" size-md="4" key={index}>
                    <IonCard onClick={() => selectRecentUser(user)} button>
                      <IonCardHeader>
                        <IonCardTitle className="ion-text-center">
                          {user.displayName || user.email.split('@')[0]}
                        </IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent className="ion-text-center">
                        <IonAvatar style={{ margin: '0 auto', width: '60px', height: '60px' }}>
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName || 'Usuario'} />
                          ) : (
                            <div style={{ 
                              width: '100%', 
                              height: '100%', 
                              backgroundColor: '#ccc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <IonIcon icon={person} size="large" />
                            </div>
                          )}
                        </IonAvatar>
                        <p className="ion-margin-top">{user.email}</p>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
            <IonText>
              <p className="ion-text-center">o inicia sesión con otra cuenta</p>
            </IonText>
          </div>
        )}

        {/* Formulario de inicio de sesión */}
        {selectedUser ? (
          <div className="ion-text-center ion-margin-bottom">
            <IonAvatar style={{ margin: '0 auto', width: '80px', height: '80px' }}>
              {selectedUser.photoURL ? (
                <img src={selectedUser.photoURL} alt={selectedUser.displayName || 'Usuario'} />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IonIcon icon={person} size="large" />
                </div>
              )}
            </IonAvatar>
            <h3>{selectedUser.displayName || selectedUser.email.split('@')[0]}</h3>
            <p>{selectedUser.email}</p>
            <IonButton 
              fill="clear" 
              onClick={clearSelectedUser}
              size="small"
            >
              <IonIcon slot="icon-only" icon={closeCircle} />
              Cambiar cuenta
            </IonButton>
          </div>
        ) : (
          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput 
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
          </IonItem>
        )}
        
        <IonItem className="ion-margin-bottom">
          <IonLabel position="floating">Contraseña</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
          />
        </IonItem>
        
        {error && (
          <IonText color="danger" className="ion-padding">
            <p>{error}</p>
          </IonText>
        )}
        
        <IonButton 
          expand="block" 
          onClick={handleLogin}
          className="ion-margin-top"
        >
          {selectedUser ? 'Iniciar sesión' : 'Ingresar'}
        </IonButton>
        
        <IonButton 
          expand="block" 
          fill="outline"
          routerLink="/register"
          className="ion-margin-top"
        >
          Registrarse
        </IonButton>
        
        <IonLoading isOpen={loading} message="Iniciando sesión..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;