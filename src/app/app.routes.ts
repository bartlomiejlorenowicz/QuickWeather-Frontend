import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OAuthCallbackComponent } from './components/oauth-callback/oauth-callback.component';
import {AuthGuard} from './guards/auth.guard';
import { SetNewPasswordComponent } from './components/set-new-password/set-new-password.component';
import {LoggedInGuard} from './guards/logged-in.guard';
import {ChangePasswordComponent} from './components/change-password/change-password.component';
import {SearchHistoryComponent} from './components/search-history/search-history.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, canActivate: [LoggedInGuard] }, // Strona główna dostępna tylko dla niezalogowanych
  { path: 'oauth-callback', component: OAuthCallbackComponent },
  { path: 'set-new-password', component: SetNewPasswordComponent },
  { path: 'login', component: LoginComponent, canActivate: [LoggedInGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [LoggedInGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'history', component: SearchHistoryComponent }
    ]
  },
  { path: '**', redirectTo: '' }, // Przekierowanie dla nieznanych tras
];
