import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoggedInGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      return true; // Użytkownik niezalogowany
    } else {
      this.router.navigate(['/dashboard']); // Przekierowanie na dashboard
      return false; // Dostęp zablokowany
    }
  }
}
