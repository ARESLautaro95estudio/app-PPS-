import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonToast
} from '@ionic/react';
import { add, logOut } from 'ionicons/icons';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useHistory } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { addRecentUser } from '../services/RecentUsers'; // Importar el servicio

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();
  const { currentUser } = useAuth();

  const fetchTasks = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('userId', '==', currentUser.uid));
      
      const querySnapshot = await getDocs(q);
      const tasksList: any[] = [];
      
      querySnapshot.forEach((doc) => {
        tasksList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTasks(tasksList);
    } catch (error) {
      console.error("Error fetching tasks: ", error);
      setToastMessage('Error al cargar las tareas');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    
    // Al montar el componente, asegurarse de que el usuario actual está en la lista de recientes
    if (currentUser) {
      addRecentUser({
        email: currentUser.email || '',
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL
      });
    }
  }, [currentUser]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchTasks();
    event.detail.complete();
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      history.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setToastMessage('Error al cerrar sesión');
      setShowToast(true);
    }
  };

  const handleAddTask = () => {
    history.push('/add-task');
  };

  const handleTaskClick = (taskId: string) => {
    history.push(`/task/${taskId}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Inicio</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSignOut}>
              <IonIcon slot="icon-only" icon={logOut} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonLoading isOpen={loading} message="Cargando tareas..." />

        <div className="ion-padding">
          <h2>Bienvenido, {currentUser?.displayName || 'Usuario'}</h2>
          <p>Aquí puedes ver tus tareas pendientes</p>
        </div>

        {tasks.length === 0 ? (
          <div className="ion-padding ion-text-center">
            <p>No tienes tareas pendientes</p>
            <IonButton expand="block" onClick={handleAddTask}>
              Crear una tarea
            </IonButton>
          </div>
        ) : (
          <IonList>
            {tasks.map((task) => (
  <IonCard key={task.id} onClick={() => handleTaskClick(task.id)}>
    <IonCardHeader>
      <IonCardSubtitle>
        {task.createdAt && new Date(task.createdAt.seconds * 1000).toLocaleDateString()}
      </IonCardSubtitle>
      <IonCardTitle>{task.titulo}</IonCardTitle>  {/* Cambiado de title a titulo */}
    </IonCardHeader>
    <IonCardContent>
      <p>{task.descripcion}</p>  {/* Cambiado de description a descripcion */}
      <IonItem lines="none">
        <IonLabel>
          Estado: {task.completed ? 'Completada' : 'Pendiente'}
        </IonLabel>
      </IonItem>
    </IonCardContent>
  </IonCard>
))}
          </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleAddTask}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;