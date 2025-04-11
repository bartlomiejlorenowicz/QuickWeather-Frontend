import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
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
import {RouterModule} from '@angular/router';
import {ChangePasswordComponent} from '../change-password/change-password.component';
import {AirQualityComponent} from '../air-quality/air-quality.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {UserService} from '../../user.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {MatListModule} from '@angular/material/list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {CountryFlagPipe} from '../pipe/country-flag.pipe';

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
    ChangePasswordComponent,
    AirQualityComponent,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule,
    MatButtonToggleModule,
    CountryFlagPipe
  ]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('forecastChart', {static: false}) forecastChart!: ElementRef<HTMLCanvasElement>;
  activeTab: string = 'dashboard';
  showDefaultContent: boolean = true;
  city: string = '';
  weatherData: any;
  history: { date: Date; city: any; weather: { feelsLike: any; condition: any; temperature: any; icon: any } }[] = [];

  // Właściwości paginacji
  pageIndex: number = 0;
  pageSize: number = 5;
  pagedHistory: typeof
  this
.
  history = [];

  userId: string | null = null;
  isLoggedIn: boolean = false;

  // Oddzielne bazy URL dla pogody i historii
  weatherBaseUrl: string = 'http://localhost:8080/api/v1/weather';
  historyBaseUrl: string = 'http://localhost:8080/api/v1/history';

  forecastData: ForecastData[] = [];
  chart: any;
  user: { name: string; email: string } = {name: '', email: ''}; // Dane użytkownika
  currentPassword: string = ''; // Hasło obecne
  newPassword: string = ''; // Nowe hasło
  confirmNewPassword: string = ''; // Potwierdzenie nowego hasła
  favoriteCity: string = ''; // Ulubione miasto

  airQualityData: any;

  loading: boolean = false;

  private chartInitialized: boolean = false;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    // Nasłuchujemy zmian w nawigacji
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log('Current URL:', event.urlAfterRedirects); // Debugging
        this.showDefaultContent = event.urlAfterRedirects === '/dashboard';
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.checkLoginStatus();
      this.loadHistory();
      this.loadUserData();
    }
  }

  sanitizeCityInput(input: string): string {
    return input.replace(/[0-9]/g, '');
  }

  searchBoth(): void {
    const sanitizedCity = this.sanitizeCityInput(this.city).trim();
    console.log('Sanitized city:', sanitizedCity);
    this.city = sanitizedCity;

    if (!this.city) {
      this.snackBar.open('Please enter a valid city name (no numbers allowed).', 'OK', {
        duration: 3000,
        verticalPosition: 'top'
      });
      return;
    }
    this.searchWeather(() => {
      this.searchAirQuality();
    });
    this.searchForecast();
  }

  searchAirQuality(): void {
    if (!this.city.trim()) {
      console.error('City name is empty.');
      return;
    }

    this.loading = true; // Pokazujemy spinner

    const endpoint = `${this.weatherBaseUrl}/air-quality?city=${this.city}`;
    this.http.get(endpoint).subscribe({
      next: (data) => {
        this.airQualityData = data;
        console.log('Air Quality Data:', this.airQualityData);
        this.loading = false; // Ukrywamy spinner po otrzymaniu danych
      },
      error: (err) => {
        console.error('Error fetching air quality data:', err);
        // Możesz ustawić zmienną np. errorMessage i wyświetlić ją w szablonie
        this.loading = false; // Ukrywamy spinner nawet w przypadku błędu
      }
    });
  }

  searchForecast(): void {
    if (!this.city.trim()) {
      this.snackBar.open('Please enter a city name to view the forecast.', 'OK', {
        duration: 4000,
        verticalPosition: "top"
      });
      return;
    }

    const endpoint = `${this.weatherBaseUrl}/forecast?city=${this.city}`;
    this.http.get<ForecastData[]>(endpoint).subscribe({
      next: (data) => {
        this.forecastData = data;
        console.log('Forecast Data:', this.forecastData); // Debugging
        this.createChart(); // Generowanie wykresu
      },
      error: (err) => {
        console.error('Error fetching forecast data:', err);
        this.snackBar.open('Could not fetch forecast data. Please try again.', 'OK', {
          duration: 4000,
          verticalPosition: "top"
        });
      },
    });
  }

  // Metoda, która ustawia widok na historię oraz pobiera historię z backendu
  showSearchHistory(): void {
    this.activeTab = 'history';
    this.loadHistory();
  }

  // Metoda createChart() – używa @ViewChild
  createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const canvasElement = this.forecastChart?.nativeElement;
    if (!canvasElement) {
      console.error('Canvas element not found!');
      return;
    }

    const labels: string[] = this.forecastData.map(item => new Date(item.date).toLocaleString());
    const temperatures: number[] = this.forecastData.map(item => item.temperature);
    const windSpeeds: number[] = this.forecastData.map(item => item.windSpeed);

    const data: ChartData<'line'> = {
      labels: labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temperatures,
          borderColor: '#3cba9f',
          backgroundColor: 'rgba(60, 186, 159, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Wind Speed (m/s)',
          data: windSpeeds,
          borderColor: '#ff5733',
          backgroundColor: 'rgba(255, 87, 51, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {display: true, position: 'top'},
        tooltip: {enabled: true}
      },
      scales: {
        x: {title: {display: true, text: 'Date'}, ticks: {autoSkip: true, maxTicksLimit: 10}},
        y: {type: 'linear', position: 'left', title: {display: true, text: 'Temperature (°C)'}},
        y1: {
          type: 'linear',
          position: 'right',
          title: {display: true, text: 'Wind Speed (m/s)'},
          grid: {drawOnChartArea: false}
        }
      }
    };

    this.chart = new Chart(canvasElement, {
      type: 'line',
      data: data,
      options: options
    });
  }

  checkLoginStatus(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = this.decodeToken(token);
          this.userId = decoded.userId;
          this.isLoggedIn = !!this.userId;
        } catch (error) {
          console.error('Error decoding token:', error);
          this.isLoggedIn = false;
          this.userId = null;
        }
      } else {
        this.isLoggedIn = false;
        this.userId = null;
      }
    }
  }

  decodeToken(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  searchWeather(callback?: () => void): void {
    if (!this.city.trim()) {
      this.snackBar.open('Please enter a city name.', 'OK', {duration: 4000, verticalPosition: "top"});
      return;
    }
    this.loading = true;

    const endpoint = this.isLoggedIn
      ? `${this.historyBaseUrl}/current-with-user-history?city=${this.city}`
      : `${this.weatherBaseUrl}/city?city=${this.city}`;

    this.http.get(endpoint).subscribe({
      next: (data) => {
        this.weatherData = data;
        if (this.isLoggedIn) {
          this.addToHistory(this.city, data);
        }
        if (callback) {
          callback();
        }
      },
      error: (err) => {
        console.error('Error fetching weather data:', err);
        this.loading = false;
      },
    });
  }

  // Metoda pobierająca historię wyszukiwań dla zalogowanego użytkownika
  loadHistory(): void {
    if (this.isLoggedIn && this.userId) {
      const endpoint = `${this.historyBaseUrl}?page=${this.pageIndex}&size=${this.pageSize}`;
      this.http.get<any[]>(endpoint).subscribe({
        next: (data) => {
          this.history = data.map((item) => ({
            city: item.city,
            date: new Date(item.searchedAt),
            weather: {
              temperature: item.weather.main.temp,
              feelsLike: item.weather.main.feels_like,
              condition: item.weather.weather[0].description,
              icon: item.weather.weather[0].icon,
            },
          }))
            // Sortujemy historię – najnowszy wpis będzie pierwszy
            .sort((a, b) => b.date.getTime() - a.date.getTime());

          // Ustawiamy paginację: zerujemy stronę i aktualizujemy pagedHistory
          this.pageIndex = 0;
          this.updatePagedHistory();
        },
        error: (err) => {
          console.error('Error fetching history:', err);
        },
      });
    }
  }

  // Aktualizuje pagedHistory na podstawie bieżącego pageIndex i pageSize
  updatePagedHistory(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedHistory = this.history.slice(startIndex, endIndex);
  }

  // Przechodzi do następnej strony, jeśli istnieje
  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.updatePagedHistory();
    }
  }

  // Przechodzi do poprzedniej strony, jeśli istnieje
  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.updatePagedHistory();
    }
  }

  // Oblicza łączną liczbę stron
  get totalPages(): number {
    return Math.ceil(this.history.length / this.pageSize);
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
      this.snackBar.open('Please enter a city name to view the forecast.', 'OK', {
        duration: 4000,
        verticalPosition: "top"
      });
      return;
    }

    this.router.navigate(['/forecast'], {queryParams: {city: this.city}});
  }

  checkAirQuality(): void {
    if (!this.weatherData) {
      this.snackBar.open('Please search for a city first to check air quality.', 'OK', {
        duration: 4000,
        verticalPosition: "top"
      });
      return;
    }

    const {lat, lon} = this.weatherData.coord;
    this.router.navigate(['/air-quality'], {queryParams: {lat, lon}});
  }

  logout(): void {
    this.authService.logout();
  }

  loadUserData(): void {
    // Załaduj dane użytkownika (z serwera lub localStorage)
    this.user = {name: 'John Doe', email: 'johndoe@example.com'};
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

  goToDashboard(): void {
    this.setActiveTab('dashboard');
  }

  ngAfterViewInit(): void {
    // Opcjonalnie, jeśli forecastData są już dostępne
    if (this.activeTab === 'dashboard' && this.forecastData && this.forecastData.length > 0) {
      this.createChart();
      this.chartInitialized = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.activeTab === 'dashboard' && this.forecastData && this.forecastData.length > 0 && !this.chartInitialized) {
      const canvasElement = this.forecastChart?.nativeElement;
      if (canvasElement) {
        this.createChart();
        this.chartInitialized = true;
      }
    }
  }

  // Metoda zmiany zakładki
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'dashboard') {
      // Resetujemy flagę
      this.chartInitialized = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        if (this.forecastData && this.forecastData.length > 0 && !this.chartInitialized) {
          this.createChart();
          this.chartInitialized = true;
        }
      }, 1000);
    }
  }

  onDeleteAccount(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Account Deletion',
        message: 'Are you sure you want to delete your account? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        if (this.userId) {
          const parsedUserId = parseInt(this.userId, 10);
          this.userService.deleteAccount(parsedUserId).subscribe({
            next: () => {
              this.snackBar.open('Your account has been deleted.', 'OK', {duration: 3000});
              this.authService.logout();
              this.router.navigate(['/login']);
            },
            error: (err: any) => {
              console.error('Error deleting account:', err);
              this.snackBar.open('Failed to delete account. Please try again later.', 'OK', {duration: 3000});
            }
          });
        } else {
          this.snackBar.open('User id is missing.', 'OK', {duration: 3000});
        }
      }
    });
  }

}
