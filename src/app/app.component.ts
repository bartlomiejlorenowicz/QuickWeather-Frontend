import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {NavigationEnd, Router, RouterLink, RouterModule} from '@angular/router';
import { AuthService } from './auth.service';
import {CommonModule} from '@angular/common';
import {HttpClient, HttpClientModule, HttpErrorResponse} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-root',
  templateUrl:'./app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ]
})
export class AppComponent implements OnInit {
  city: string = '';
  weatherData: any;
  isLoggedIn: boolean = false;
  showMainHeader: boolean = true; // Kontroluje widoczność głównego headera
  showWeatherSearch: boolean = true; // Kontroluje widoczność sekcji wyszukiwania pogody
  isDashboardRoute: boolean = false;

  constructor(private authService: AuthService,
              private router: Router,
              private cdr: ChangeDetectorRef,
              private http: HttpClient,
              ) {
  }

  ngOnInit(): void {
    // Subskrybuj zmiany nawigacji
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Lista tras, na których ukrywamy sekcję wyszukiwania pogody
        const hiddenRoutes = ['/dashboard', '/dashboard/history', '/dashboard/change-password'];
        this.showWeatherSearch = !hiddenRoutes.includes(event.urlAfterRedirects);
      }
    });

    // Subskrybuj zmiany statusu logowania
    this.authService.loginStatusChanged.subscribe((status) => {
      this.isLoggedIn = status;
      this.cdr.detectChanges(); // Wymuś odświeżenie widoku
    });

    // Sprawdź status logowania przy starcie aplikacji
    this.updateLoginStatus();

    // Subskrybuj zmiany nawigacji
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isDashboardRoute = event.urlAfterRedirects === '/dashboard';
        this.showMainHeader = !['/dashboard'].includes(event.urlAfterRedirects);
        this.updateWeatherSearchVisibility(event.urlAfterRedirects);
      }
    });
  }

  updateWeatherSearchVisibility(currentUrl: string): void {
    const hiddenRoutes = ['/login', '/register', '/dashboard'];
    this.showWeatherSearch = !hiddenRoutes.includes(currentUrl);
  }


  updateLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.cdr.detectChanges(); // Wymuszenie odświeżenia widoku
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  searchWeather(): void {
    if (!this.city.trim()) {
      alert('Please enter a city name.');
      return;
    }

    const backendUrl = `http://localhost:8080/api/weather/city?city=${this.city}`;

    this.http.get<any>(backendUrl).subscribe({ // Określenie typu zwracanego przez HTTP
      next: (data: any) => { // Typ dla "data"
        console.log('Response from backend:', data);
        this.weatherData = data;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          alert('City not found. Please try another one.');
        } else if (err.status === 500) {
          alert('Server error. Please try again later.');
        } else {
          alert('An unexpected error occurred. Please try again.');
        }
        console.error('Error fetching weather data:', err);
      },
    });
  }

}
