import { Redirect, Route, RouteProps } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { IonLoading } from '@ionic/react';

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <IonLoading isOpen={true} message="Cargando..." />;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        currentUser ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default PrivateRoute;