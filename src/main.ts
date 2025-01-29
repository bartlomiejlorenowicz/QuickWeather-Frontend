import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';
import {provideHttpClient, HttpClientModule, HTTP_INTERCEPTORS, withFetch} from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import {AuthInterceptor} from './app/auth.interceptor';
import {provideAnimations} from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule), // Import HttpClientModule
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(withFetch()),
    {
      provide: HTTP_INTERCEPTORS, // Rejestracja interceptora
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
