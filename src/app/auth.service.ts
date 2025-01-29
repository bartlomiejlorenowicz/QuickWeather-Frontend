import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {Subject} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'token';
  loginStatusChanged = new Subject<boolean>(); // Observable do powiadomień

  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  // Funkcja sprawdzająca, czy użytkownik jest zalogowany
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      this.loginStatusChanged.next(false); // Powiadomienie o wylogowaniu
      this.router.navigate(['/']); // Przekierowanie na stronę główną
    }
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
      this.loginStatusChanged.next(true); // Powiadomienie o zalogowaniu
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

}
