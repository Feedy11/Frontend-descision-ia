import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter }                                  from '@angular/router';
import { provideHttpClient, withInterceptors }            from '@angular/common/http';

import { routes }          from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])   // ← auto-inject Bearer token
    ),
        provideToastr({
      // Position
      positionClass: 'toast-top-right',

      // Durée
      timeOut: 4000,
      extendedTimeOut: 1000,

      // Animations
      easeTime: 300, // Durée de l'animation (ms)
      progressBar: true, // Barre de progression
      progressAnimation: 'decreasing', // Animation de la barre: 'decreasing' ou 'increasing'

      // 🔔 Comportement
      closeButton: true, // Bouton de fermeture
      tapToDismiss: true, // Cliquer pour fermer
      preventDuplicates: true, // Éviter les doublons
      resetTimeoutOnDuplicate: true, // Reset le timer sur doublon

      // 📱 Options avancées
      newestOnTop: true, // Nouveau toast en haut
      maxOpened: 5, // Nombre max de toasts affichés
      autoDismiss: true, // Fermeture auto des anciens si maxOpened atteint

      // Classe CSS personnalisée
      toastClass: 'ngx-toastr custom-toast', // Classe pour personnalisation

      // Animations d'entrée/sortie
      easing: 'ease-in-out',

      //  Messages
      enableHtml: true, // Permettre HTML dans les messages

      // Icônes
      iconClasses: {
        error: 'toast-error',
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning',
      },
    }),
  ]
};
