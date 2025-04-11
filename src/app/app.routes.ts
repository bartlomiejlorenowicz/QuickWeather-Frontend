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
import {ForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {SetForgotPasswordComponent} from './components/set-forgot-password/set-forgot-password.component';
import {RequestResetPasswordComponent} from './components/request-reset-password/request-reset-password.component';
import { AdminGuard } from './guards/admin.guard';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import {AdminLayoutComponent} from './components/admin-layout/admin-layout.component';
import { AdminOverviewComponent } from './components/admin-overview-component/admin-overview-component.component';
import {SystemLogsComponent} from './components/admin-system-logs/admin-system-logs.component';
import {AdminChangePasswordComponent} from './components/admin-change-password/admin-change-password.component';
import {
  AdminActivitySearchComponent
} from './components/admin-activity-search-component/admin-activity-search-component.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent, canActivate: [LoggedInGuard] },
  { path: 'oauth-callback', component: OAuthCallbackComponent },
  { path: 'set-new-password', component: SetNewPasswordComponent },
  { path: 'login', component: LoginComponent, canActivate: [LoggedInGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [LoggedInGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'set-new-password', component: SetForgotPasswordComponent },
  { path: 'request-reset-password', component: RequestResetPasswordComponent },
  { path: 'set-forgot-password', component: SetForgotPasswordComponent },


  {
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard],
  children: [

  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'history', component: SearchHistoryComponent },
  { path: '', component: DashboardComponent }
]
},
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', component: AdminOverviewComponent },
      { path: 'reports', component: AdminActivitySearchComponent },
      { path: 'users', component: AdminUsersComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'logs', component: SystemLogsComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'change-password', component: AdminChangePasswordComponent, canActivate: [AdminGuard]},

    ]
  },
  { path: '**', redirectTo: '' },
];
