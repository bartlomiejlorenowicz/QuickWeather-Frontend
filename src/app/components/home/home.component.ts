import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef
} from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ForecastData } from '../../models/forecast-data.model';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { AirQualityComponent } from '../air-quality/air-quality.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CountryFlagPipe } from '../pipe/country-flag.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    AirQualityComponent,
    MatTooltipModule,
    MatSnackBarModule,
    CountryFlagPipe
  ]
})
export class HomeComponent implements OnInit {
  // Typ wyszukiwania: domyślnie "city"
  searchType: 'city' | 'zipcode' | 'coordinates' = 'city';

  // Dane wejściowe dla różnych typów wyszukiwania
  city: string = '';
  zipcode: string = '';
  latitude: string = '';
  longitude: string = '';

  // Dane zwrócone z API
  weatherData: any;
  forecastData: ForecastData[] = [];
  airQualityData: any;
  chart!: Chart<'line'>;

  // Adres backendu
  apiBaseUrl: string = 'http://localhost:8080/api/v1/weather';

  @ViewChild('forecastChart', {static: false}) forecastChart!: ElementRef;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
  }

  ngOnInit(): void {

  }

  /**
   * Metoda wywołująca odpowiednie zapytania w zależności od wybranego typu wyszukiwania.
   */
  searchBoth(): void {
    if (this.searchType === 'city') {
      // Wyszukiwanie po nazwie miasta
      this.searchWeather(() => this.searchAirQuality());
      this.searchForecast();
    } else if (this.searchType === 'coordinates') {
      // Wyszukiwanie po współrzędnych
      this.searchByCoordinates();
    }
  }

  // Wyszukiwanie danych pogodowych po mieście
  searchWeather(callback?: () => void): void {
    if (!this.city.trim()) {
      this.snackBar.open('Please enter a city name.', 'OK', {duration: 4000});
      return;
    }
    const endpoint = `${this.apiBaseUrl}/city?city=${this.city}`;
    this.http.get(endpoint).subscribe({
      next: (data) => {
        this.weatherData = data;
        if (callback) callback();
      },
      error: (err) => {
        console.error('Error fetching weather data by city:', err);
        this.snackBar.open('Could not fetch weather data. Please try again.', 'OK', {duration: 4000});
      }
    });
  }

  // Wyszukiwanie po współrzędnych – pobieramy dane pogodowe, prognozę i jakość powietrza
  searchByCoordinates(): void {
    if (!this.latitude.trim() || !this.longitude.trim()) {
      this.snackBar.open('Please enter both latitude and longitude.', 'OK', {duration: 4000});
      return;
    }
    // Pobieramy bieżące dane pogodowe
    const endpointWeather = `${this.apiBaseUrl}/coordinate?lat=${this.latitude}&lon=${this.longitude}`;
    this.http.get(endpointWeather).subscribe({
      next: (data: any) => {
        this.weatherData = data;
        this.city = data.name;
        this.searchForecastByCoordinates();
        this.searchAirQualityByCoordinates();
      },
      error: (err) => {
        console.error('Error fetching weather data by coordinates:', err);
        this.snackBar.open('Could not fetch weather data by coordinates. Please try again.', 'OK', {duration: 4000});
      }
    });
  }

  // Wyszukiwanie prognozy po współrzędnych
  searchForecastByCoordinates(): void {
    const endpointForecast = `${this.apiBaseUrl}/forecast?lat=${this.latitude}&lon=${this.longitude}`;
    this.http.get<ForecastData[]>(endpointForecast).subscribe({
      next: (data) => {
        this.forecastData = data;
        this.createChart();
      },
      error: (err) => {
        console.error('Error fetching forecast data by coordinates:', err);
        this.snackBar.open('Could not fetch forecast data. Please try again.', 'OK', {duration: 4000});
      }
    });
  }

  // Wyszukiwanie danych o jakości powietrza po współrzędnych
  searchAirQualityByCoordinates(): void {
    // Resetujemy poprzednie dane
    this.airQualityData = null;

    // Dodajemy parametr cache-busting (timestamp)
    const timestamp = new Date().getTime();
    const endpointAirQuality = `${this.apiBaseUrl}/air-quality?lat=${this.latitude}&lon=${this.longitude}&t=${timestamp}`;

    this.http.get(endpointAirQuality).subscribe({
      next: (data) => {
        this.airQualityData = data;
      },
      error: (err) => {
        console.error('Error fetching air quality data by coordinates:', err);
        this.snackBar.open('Could not fetch air quality data. Please try again.', 'OK', {duration: 4000});
      }
    });
  }

  // Wyszukiwanie prognozy dla miasta – wywoływany, gdy searchType === 'city'
  searchForecast(): void {
    if (!this.city.trim()) {
      this.snackBar.open('Please enter a city name for forecast.', 'OK', {duration: 4000});
      return;
    }
    const endpointForecast = `${this.apiBaseUrl}/forecast?city=${this.city}`;
    this.http.get<ForecastData[]>(endpointForecast).subscribe({
      next: (data) => {
        this.forecastData = data;
        this.createChart();
      },
      error: (err) => {
        console.error('Error fetching forecast data:', err);
        this.snackBar.open('Could not fetch forecast data. Please try again.', 'OK', {duration: 4000});
      }
    });
  }

  // Wyszukiwanie danych o jakości powietrza dla miasta – wywoływany, gdy searchType === 'city'
  searchAirQuality(): void {
    if (!this.city.trim()) {
      this.snackBar.open('Please enter a city name for air quality.', 'OK', {duration: 4000});
      return;
    }
    const endpointAirQuality = `${this.apiBaseUrl}/air-quality?city=${this.city}`;
    this.http.get(endpointAirQuality).subscribe({
      next: (data) => {
        this.airQualityData = data;
        // Wyświetl nagłówek, korzystając z przechowywanej wartości city
        console.log(`Air Quality in ${this.city}`);
      },
      error: (err) => {
        console.error('Error fetching air quality data:', err);
        this.snackBar.open('Could not fetch air quality data. Please try again.', 'OK', {duration: 4000});
      }
    });
  }

//   // Metoda tworzenia wykresu prognozy za pomocą Chart.js
//   createChart(): void {
//     if (this.chart) {
//       this.chart.destroy();
//     }
//     const canvasElement = document.getElementById('forecastChart') as HTMLCanvasElement;
//     if (!canvasElement) {
//       console.error('Canvas element not found!');
//       return;
//     }
//     const labels: string[] = this.forecastData.map(item => new Date(item.date).toLocaleString());
//     const temperatures: number[] = this.forecastData.map(item => item.temperature);
//     const windSpeeds: number[] = this.forecastData.map(item => item.windSpeed);
//     const data: ChartData<'line'> = {
//       labels: labels,
//       datasets: [
//         {
//           label: 'Temperature (°C)',
//           data: temperatures,
//           borderColor: '#3cba9f',
//           backgroundColor: 'rgba(60, 186, 159, 0.2)',
//           borderWidth: 2,
//           tension: 0.4,
//           yAxisID: 'y'
//         },
//         {
//           label: 'Wind Speed (m/s)',
//           data: windSpeeds,
//           borderColor: '#ff5733',
//           backgroundColor: 'rgba(255, 87, 51, 0.2)',
//           borderWidth: 2,
//           tension: 0.4,
//           yAxisID: 'y1'
//         }
//       ]
//     };
//     const options: ChartOptions<'line'> = {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: { display: true, position: 'top' },
//         tooltip: { enabled: true }
//       },
//       scales: {
//         x: { title: { display: true, text: 'Date' }, ticks: { autoSkip: true, maxTicksLimit: 10 } },
//         y: { type: 'linear', position: 'left', title: { display: true, text: 'Temperature (°C)' } },
//         y1: { type: 'linear', position: 'right', title: { display: true, text: 'Wind Speed (m/s)' }, grid: { drawOnChartArea: false } }
//       }
//     };
//     this.chart = new Chart(canvasElement, {
//       type: 'line',
//       data: data,
//       options: options
//     });
//   }
// }

  createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    const canvasElement = document.getElementById('forecastChart') as HTMLCanvasElement;
    if (!canvasElement) {
      console.error('Canvas element not found!');
      return;
    }

    // Przygotowanie etykiet i danych z forecastData
    const labels: string[] = this.forecastData.map(item => item.date);
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
          fill: false,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Wind Speed (m/s)',
          data: windSpeeds,
          borderColor: '#ff5733',
          backgroundColor: 'rgba(255, 87, 51, 0.2)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Temperature (°C)'
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Wind Speed (m/s)'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    };

    this.chart = new Chart(canvasElement, {
      type: 'line',
      data: data,
      options: options
    });
  }

}
