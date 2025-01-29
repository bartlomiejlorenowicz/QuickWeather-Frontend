import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      console.log('AuthGuard: isLoggedIn =', this.authService.isLoggedIn());
      return true; // Użytkownik zalogowany
    } else {
      this.router.navigate(['/login']); // Przekierowanie na login
      return false; // Dostęp zablokowany
    }
  }

}
