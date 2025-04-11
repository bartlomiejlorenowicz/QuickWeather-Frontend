import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { User } from './models/user.model';
import jwtDecode from 'jwt-decode';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'token';
  private isLoggedInSource = new BehaviorSubject<boolean>(this.isLoggedIn());
  loginStatusChanged = this.isLoggedInSource.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  isLoggedIn(): boolean {
    return this.isBrowser() ? !!localStorage.getItem(this.tokenKey) : false;
  }

  login(): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, 'test-token');
      this.isLoggedInSource.next(true);
    }
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      this.isLoggedInSource.next(false);
    }
  }

  saveToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
      this.isLoggedInSource.next(true);
    }
  }

  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.tokenKey) : null;
  }

  getUser(): User | null {
    const token = this.getToken();
    console.log('Token z localStorage:', token);
    if (token) {
      try {
        console.log('jwtDecode typeof:', typeof jwtDecode);
        const decoded = jwtDecode(token);
        console.log('Zdekodowany token:', decoded);
        return decoded as User;
      } catch (error) {
        console.error('Błąd dekodowania tokena:', error);
        return null;
      }
    }
    return null;
  }

}
