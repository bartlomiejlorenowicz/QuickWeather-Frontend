import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {NavigationEnd, Router} from '@angular/router';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {ForecastData} from '../../models/forecast-data.model';
import {Chart, ChartConfiguration, ChartData, ChartOptions, registerables} from 'chart.js';
import {AuthService} from '../../auth.service';
import { RouterModule } from '@angular/router';

// Rejestracja komponentów Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
  ]
})
export class DashboardComponent implements OnInit {
  showDefaultContent: boolean = true;
  city: string = '';
  weatherData: any;
  history: {
    city: string;
    date: Date;
    weather: {
      temperature: number;
      feelsLike: number;
      condition: string;
      icon: string;
    };
  }[] = [];
  userId: string | null = null;
  isLoggedIn: boolean = false;
  apiBaseUrl: string = 'http://localhost:8080/api/weather';
  forecastData: ForecastData[] = [];
  chart: any;
  user: { name: string; email: string } = { name: '', email: '' }; // Dane użytkownika
  currentPassword: string = ''; // Hasło obecne
  newPassword: string = ''; // Nowe hasło
  confirmNewPassword: string = ''; // Potwierdzenie nowego hasła
  favoriteCity: string = ''; // Ulubione miasto
  activeTab: string = 'dashboard';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
  }

  ngOnInit(): void {
    // Nasłuchujemy zmian w nawigacji
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Jeśli użytkownik przechodzi do history lub change-password → ukrywamy domyślną zawartość
        this.showDefaultContent = !['/dashboard/history', '/dashboard/change-password'].includes(event.urlAfterRedirects);
      }
    });
    if (isPlatformBrowser(this.platformId)) {
      this.checkLoginStatus();
      this.loadHistory();
      this.loadUserData(); // Pobierz dane użytkownika przy ładowaniu komponentu
    }
  }

  searchBoth(): void {
    this.searchWeather();  // Wywołuje pobieranie bieżącej pogody
    this.searchForecast(); // Wywołuje pobieranie prognozy pogody
  }

  searchForecast(): void {
    if (!this.city.trim()) {
      alert('Please enter a city name to view the forecast.');
      return;
    }

    const endpoint = `http://localhost:8080/api/weather/forecast?city=${this.city}`;
    this.http.get<ForecastData[]>(endpoint).subscribe({
      next: (data) => {
        this.forecastData = data;
        console.log('Forecast Data:', this.forecastData); // Debugging
        this.createChart(); // Generowanie wykresu
      },
      error: (err) => {
        console.error('Error fetching forecast data:', err);
        alert('Could not fetch forecast data. Please try again.');
      },
    });
  }

  createChart(): void {
    if (this.chart) {
      this.chart.destroy(); // Usuń istniejący wykres, jeśli istnieje
    }

    // Mapowanie danych
    const labels: string[] = this.forecastData.map((item) => item.date.toString());
    const temperatures: number[] = this.forecastData.map((item) => item.temperature);
    const windSpeeds: number[] = this.forecastData.map((item) => item.windSpeed);

    // Poprawna konfiguracja danych dla Chart.js
    const data: { datasets: ({ borderColor: string; backgroundColor: string; tension: number; data: number[]; borderWidth: number; label: string; yAxisID: string } | { borderColor: string; backgroundColor: string; tension: number; data: number[]; borderWidth: number; label: string; yAxisID: string })[]; labels: string[] } = {
      labels: labels, // Tablica stringów dla osi X
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temperatures, // Tablica liczb dla temperatury
          borderColor: '#3cba9f',
          backgroundColor: 'rgba(60, 186, 159, 0.2)', // Kolor wypełnienia
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y', // Powiązanie z osią Y
        },
        {
          label: 'Wind Speed (m/s)',
          data: windSpeeds, // Tablica liczb dla prędkości wiatru
          borderColor: '#ff5733',
          backgroundColor: 'rgba(255, 87, 51, 0.2)', // Kolor wypełnienia
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y1', // Powiązanie z osią Y1
        },
      ],
    };

    // Opcje konfiguracji wykresu
    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10,
          },
        },
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Temperature (°C)',
          },
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Wind Speed (m/s)',
          },
          grid: {
            drawOnChartArea: false, // Wyłącz linie siatki dla drugiej osi
          },
        },
      },
    };

    // Pobranie elementu canvas
    const canvasElement = document.getElementById('forecastChart') as HTMLCanvasElement;
    if (!canvasElement) {
      console.error('Canvas element not found!');
      return;
    }

    // Tworzenie wykresu
    this.chart = new Chart(canvasElement, {
      type: 'line', // Typ wykresu
      data: data, // Dane wykresu
      options: options, // Opcje wykresu
    });
  }


  checkLoginStatus(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        this.isLoggedIn = true;
        this.userId = this.decodeToken(token).userId;
      } else {
        this.isLoggedIn = false;
      }
    }
  }

  decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  searchWeather(): void {
    if (!this.city.trim()) {
      alert('Please enter a city name.');
      return;
    }

    const endpoint = this.isLoggedIn
      ? `${this.apiBaseUrl}/current-with-user-history?userId=${this.userId}&city=${this.city}`
      : `${this.apiBaseUrl}/city?city=${this.city}`;

    this.http.get(endpoint).subscribe({
      next: (data) => {
        this.weatherData = data;
        if (this.isLoggedIn) {
          this.addToHistory(this.city, data);
        }
      },
      error: (err) => {
        console.error('Error fetching weather data:', err);
        alert('Could not fetch weather data. Please try again.');
      },
    });
  }

  loadHistory(): void {
    if (this.isLoggedIn && this.userId) {
      const endpoint = `${this.apiBaseUrl}/history?userId=${this.userId}`;
      this.http.get<any[]>(endpoint).subscribe({
        next: (data) => {
          // Mapa historii do wyświetlania w frontendzie
          this.history = data.map((item) => ({
            city: item.city,
            date: new Date(item.searchedAt),
            weather: {
              temperature: item.weather.temperature,
              feelsLike: item.weather.feelsLike,
              condition: item.weather.condition,
              icon: item.weather.icon,
            },
          }));
        },
        error: (err) => {
          console.error('Error fetching history:', err);
        },
      });
    }
  }

  addToHistory(city: string, weatherData: any): void {
    const newEntry = {
      city: city,
      date: new Date(),
      weather: {
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        condition: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon,
      },
    };
    this.history.push(newEntry);
  }

  removeFromHistory(item: {
    city: string;
    date: Date;
    weather: { temperature: number; feelsLike: number; condition: string; icon: string };
  }): void {
    this.history = this.history.filter((entry) => entry !== item);
  }

  viewForecast(): void {
    if (!this.city.trim()) {
      alert('Please enter a city name to view the forecast.');
      return;
    }

    this.router.navigate(['/forecast'], { queryParams: { city: this.city } });
  }

  checkAirQuality(): void {
    if (!this.weatherData) {
      alert('Please search for a city first to check air quality.');
      return;
    }

    const { lat, lon } = this.weatherData.coord;
    this.router.navigate(['/air-quality'], { queryParams: { lat, lon } });
  }

  logout(): void {
    this.authService.logout();
  }

  loadUserData(): void {
    // Załaduj dane użytkownika (z serwera lub localStorage)
    this.user = { name: 'John Doe', email: 'johndoe@example.com' };
  }

  // Metoda zmiany hasła
  changePassword(): void {
    if (this.newPassword !== this.confirmNewPassword) {
      alert('Passwords do not match!');
      return;
    }

    alert('Password changed successfully!');
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  saveSettings(): void {
    alert('Favorite city saved: ' + this.favoriteCity);
  }

  goToChangePassword(): void {
    this.router.navigate(['/change-password']);
  }


}
