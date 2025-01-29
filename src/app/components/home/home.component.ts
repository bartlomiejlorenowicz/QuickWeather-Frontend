import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
  ],
})
export class HomeComponent {
  city: string = '';
  weatherData: any;
  isLoggedIn: boolean = false;

  constructor( private http: HttpClient,
               private router: Router,
               @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Sprawdzenie, czy jesteśmy po stronie przeglądarki
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token; // Ustaw na true, jeśli token istnieje
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Usuń token i ustaw użytkownika jako niezalogowanego
      localStorage.removeItem('token');
    }
    this.isLoggedIn = false;
    this.router.navigate(['/login']); // Przekierowanie na stronę logowania
  }

  searchWeather(): void {
    if (!this.city.trim()) {
      alert('Please enter a city name.');
      return;
    }

    const backendUrl = `http://localhost:8080/api/weather/city?city=${this.city}`;

    this.http.get(backendUrl).subscribe({
      next: (data) => {
        console.log('Response from backend:', data);
        this.weatherData = data;
      },
      error: (err) => {
        console.error('Error fetching weather data:', err);
        alert('Could not fetch weather data. Please try again.');
      },
    });
  }

  getWeatherIcon(iconCode: string): string {
    return iconCode ? `owm-${iconCode}` : ''
  }
}

