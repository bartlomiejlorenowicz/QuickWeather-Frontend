import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { Chart, ChartConfiguration, ChartData, ChartOptions, registerables } from 'chart.js';
import { ForecastData } from '../../models/forecast-data.model';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {CountryFlagPipe} from '../pipe/country-flag.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-public-weather',
  standalone: true,
  templateUrl: './public-weather.component.html',
  styleUrls: ['./public-weather.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    MatSnackBarModule,
    CountryFlagPipe
  ]
})
export class PublicWeatherComponent implements OnInit {
  city: string = '';
  weatherData: any;
  forecastData: ForecastData[] = [];
  chart: Chart | undefined;
  apiBaseUrl: string = 'http://localhost:8080/api/v1/weather';

  @ViewChild('forecastCanvas', { static: false }) forecastCanvas!: ElementRef;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // wstępnie załadować dane dla domyślnego miasta.
  }

  sanitizeCityInput(input: string): string {
    return input.replace(/[^A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż\s]/g, '');
  }

  searchBoth(): void {
    console.log("Sanitazed city before")
    const sanitizedCity = this.sanitizeCityInput(this.city).trim();
    console.log('Sanitized city:', sanitizedCity);
    this.city = sanitizedCity;

    if (this.city == 6666) {
      console.log("Snackbar should open")
      this.snackBar.open('Please enter a city name.', 'OK', { duration: 3000 });
      return;
    }
    this.searchWeather();
    this.searchForecast();
  }

  searchWeather(): void {
    const endpoint = `${this.apiBaseUrl}/city?city=${this.city}`;
    this.http.get(endpoint).subscribe({
      next: (data) => {
        this.weatherData = data;
      },
      error: (err) => {
        console.error('Error fetching weather data:', err);
        this.snackBar.open('Could not fetch weather data. Please try again.', 'OK', {
          duration: 3000
        });
      },
    });
  }

  searchForecast(): void {
    if (!this.city.trim()) {
      this.snackBar.open('Please enter a city name to view the forecast.', 'OK', {
        duration: 3000
      });
      return;
    }
    const endpoint = `${this.apiBaseUrl}/forecast?city=${this.city}`;
    this.http.get<ForecastData[]>(endpoint).subscribe({
      next: (data) => {
        this.forecastData = data;
        this.createChart();
      },
      error: (err) => {
        console.error('Error fetching forecast data:', err);
        this.snackBar.open('Could not fetch forecast data. Please try again.', 'OK', {
          duration: 3000
        });
      },
    });
  }

  createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const canvasElement = document.getElementById('forecastChart') as HTMLCanvasElement;
    if (!canvasElement) {
      console.error('Canvas element not found!');
      return;
    }

    // Mapowanie danych do wykresu
    const labels: string[] = this.forecastData.map((item) => new Date(item.date).toLocaleString());
    const temperatures: number[] = this.forecastData.map((item) => item.temperature);
    const windSpeeds: number[] = this.forecastData.map((item) => item.windSpeed);

    const data: { datasets: ({ borderColor: string; backgroundColor: string; tension: number; data: number[]; borderWidth: number; label: string; yAxisID: string } | { borderColor: string; backgroundColor: string; tension: number; data: number[]; borderWidth: number; label: string; yAxisID: string })[]; labels: string[] } = {
      labels: labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temperatures,
          borderColor: '#3cba9f',
          backgroundColor: 'rgba(60, 186, 159, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Wind Speed (m/s)',
          data: windSpeeds,
          borderColor: '#ff5733',
          backgroundColor: 'rgba(255, 87, 51, 0.2)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          title: { display: true, text: 'Date' },
          ticks: { autoSkip: true, maxTicksLimit: 10 },
        },
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Temperature (°C)' },
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Wind Speed (m/s)' },
          grid: { drawOnChartArea: false },
        },
      },
    };

    this.chart = new Chart(canvasElement, {
      type: 'line',
      data: data,
      options: options,
    });
  }
}
