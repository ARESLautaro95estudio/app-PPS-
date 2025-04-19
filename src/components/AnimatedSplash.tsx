import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import './AnimatedSplash.css';

const AnimatedSplash: React.FC<{onFinished: () => void}> = ({ onFinished }) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Set a timeout for the entire animation sequence
    const timeout = setTimeout(() => {
      setAnimationComplete(true);
      onFinished();
    }, 3000); // Total animation duration (3 seconds)

    return () => clearTimeout(timeout);
  }, [onFinished]);

  return (
    <IonPage className="animated-splash">
      <IonContent fullscreen>
        <div className="splash-container">
          <h1 className="name-text">YOUR NAME AND SURNAME</h1>
          <div className="icon-container">
            <img src="/assets/icon/icon.png" alt="App Icon" className="app-icon" />
          </div>
          <h3 className="division-text">YOUR DIVISION</h3>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AnimatedSplash;