// Actualización necesaria en capacitor.config.ts
// Agregar configuración para el plugin de cámara

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.laureano.tareasapp',
  appName: 'AppL.M.PrimerEtapa',
  webDir: 'dist',
  // bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 5000,
      launchAutoHide: true,
      backgroundColor: "#3880ff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    // Configuración para el plugin de cámara (necesario para el flash)
    Camera: {
      // Permisos básicos para acceder al flash
      permissions: {
        camera: "granted",
        photos: "granted"
      }
    },
    // Configuración para haptics (ya existente pero asegurar configuración)
    Haptics: {
      // Configuraciones específicas si fuera necesario
    }
  }
};

export default config;