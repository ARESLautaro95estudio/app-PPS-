// recentUsers.ts
interface RecentUser {
    email: string;
    displayName?: string;
    photoURL?: string;
    lastLogin: number; // timestamp
  }
  
  const RECENT_USERS_KEY = 'recentUsers';
  const MAX_RECENT_USERS = 3;
  
  // Obtener las cuentas recientes del localStorage
  export const getRecentUsers = (): RecentUser[] => {
    try {
      const storedUsers = localStorage.getItem(RECENT_USERS_KEY);
      if (!storedUsers) return [];
      
      return JSON.parse(storedUsers);
    } catch (error) {
      console.error('Error al obtener usuarios recientes:', error);
      return [];
    }
  };
  
  // Añadir un usuario al historial de recientes
  export const addRecentUser = (user: { 
    email: string; 
    displayName?: string | null; 
    photoURL?: string | null;
  }): void => {
    try {
      const recentUsers = getRecentUsers();
      
      // Verificar si el usuario ya existe en el historial
      const existingIndex = recentUsers.findIndex(u => u.email === user.email);
      
      // Crear el objeto de usuario reciente
      const recentUser: RecentUser = {
        email: user.email,
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        lastLogin: Date.now()
      };
      
      if (existingIndex >= 0) {
        // Actualizar usuario existente y moverlo al principio
        recentUsers.splice(existingIndex, 1);
      }
      
      // Añadir al principio de la lista
      recentUsers.unshift(recentUser);
      
      // Mantener solo los 3 más recientes
      const updatedUsers = recentUsers.slice(0, MAX_RECENT_USERS);
      
      // Guardar en localStorage
      localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error al guardar usuario reciente:', error);
    }
  };
  
  // Eliminar un usuario del historial
  export const removeRecentUser = (email: string): void => {
    try {
      const recentUsers = getRecentUsers();
      const updatedUsers = recentUsers.filter(user => user.email !== email);
      localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error al eliminar usuario reciente:', error);
    }
  };