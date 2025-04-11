import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartItem } from 'chart.js';

interface CityLog {
  city: string;
  count: number;
}

interface TopWeather {
  label: string;
  count: number;
}

interface AdminStatsResponse {
  activeUsers: number;
  totalUsers: number;
  inactiveUsers: number;
  cityLogs: CityLog[];
  topWeather: TopWeather;
}

@Component({
  selector: 'app-admin-overview',
  templateUrl: './admin-overview-component.component.html',
  styleUrls: ['./admin-overview-component.component.css']
})
export class AdminOverviewComponent implements OnInit, AfterViewInit {

  statsData!: AdminStatsResponse;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  ngAfterViewInit(): void {
    if (this.statsData) {
      this.createCharts();
    }
  }

  loadDashboardStats(): void {
    this.http.get<AdminStatsResponse>('/api/v1/admin/stats').subscribe(
      stats => {
        this.statsData = stats;
        setTimeout(() => this.createCharts(), 0);
      },
      error => {
        console.error('Error getting statistics:', error);
      }
    );
  }

  createCharts(): void {
    this.createCombinedBarChart('usersChart');
    this.createModernDoughnutChart('topWeatherChart', this.statsData.topWeather);
    this.createModernCityLogsBarChart('cityLogsChart', this.statsData.cityLogs);
  }

  createCombinedBarChart(canvasId: string): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error('Missing canvas element:', canvasId);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get context for:', canvasId);
      return;
    }

    // Przygotowanie etykiet i danych
    const labels = ['Total Users', 'Active Users', 'Inactive Users'];
    const data = [
      this.statsData.totalUsers,
      this.statsData.activeUsers,
      this.statsData.inactiveUsers
    ];

    const backgroundColors = [
      'rgba(58, 123, 213, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(255, 99, 132, 0.8)'
    ];
    const borderColors = [
      'rgba(58, 123, 213, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(255, 99, 132, 1)'
    ];

    new Chart(ctx as ChartItem, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Users Statistics',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 6,
          barPercentage: 0.5
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              font: { size: 14, family: 'Roboto, sans-serif' },
              color: '#444'
            }
          }
        },
        scales: {
          x: {
            ticks: { font: { size: 12, family: 'Roboto, sans-serif' }, color: '#444' },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { font: { size: 12, family: 'Roboto, sans-serif' }, color: '#444' },
            grid: { color: 'rgba(200,200,200,0.2)' }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutBounce'
        }
      }
    });
  }

  createModernDoughnutChart(canvasId: string, dataObj: TopWeather): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error('Missing canvas element:', canvasId);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get context for:', canvasId);
      return;
    }

    const topCityLabel = `Most frequently chosen city: ${dataObj.label}`;

    new Chart(ctx as ChartItem, {
      type: 'doughnut',
      data: {
        labels: [topCityLabel],
        datasets: [{
          data: [dataObj.count],
          backgroundColor: ['rgba(255, 159, 64, 0.8)'],
          borderColor: ['#fff'],
          borderWidth: 2
        }]
      },
      options: {
        cutout: '70%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              font: { size: 14, family: 'Roboto, sans-serif' },
              color: '#444'
            }
          }
        },
        animation: {
          animateRotate: true,
          duration: 1500
        }
      }
    });
  }

  createModernCityLogsBarChart(canvasId: string, cityLogs: CityLog[]): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error('Missing canvas element:', canvasId);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get context for:', canvasId);
      return;
    }
    const labels = cityLogs.map(log => log.city);
    const data = cityLogs.map(log => log.count);

    // Utwórz gradient dla wykresu
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(153, 102, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(201, 203, 207, 0.8)');

    new Chart(ctx as ChartItem, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Number of queries by city',
          data: data,
          backgroundColor: gradient,
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              font: { size: 14, family: 'Roboto, sans-serif' },
              color: '#444'
            }
          }
        },
        scales: {
          x: {
            ticks: { font: { size: 12, family: 'Roboto, sans-serif' }, color: '#444' },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { font: { size: 12, family: 'Roboto, sans-serif' }, color: '#444' },
            grid: { color: 'rgba(200,200,200,0.2)' }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutBounce'
        }
      }
    });
  }
}
