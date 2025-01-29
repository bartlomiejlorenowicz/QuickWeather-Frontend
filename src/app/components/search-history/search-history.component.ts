import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-search-history',
  templateUrl: './search-history.component.html',
  styleUrls: ['./search-history.component.css'],
  standalone: true, // Komponent standalone
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    FormsModule,
  ],
})
export class SearchHistoryComponent implements OnInit {
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

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    console.log('SearchHistoryComponent loaded.');
    this.loadHistory();
  }

  loadHistory(): void {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      alert('You must be logged in to view history.');
      this.router.navigate(['/login']);
      return;
    }

    const endpoint = `http://localhost:8080/api/weather/history?userId=${userId}`;
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any[]>(endpoint, { headers }).subscribe({
      next: (data) => {
        console.log('History data:', data);
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
        if (err.status === 401) {  // 🔹 Obsługa błędu autoryzacji
          alert('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          this.router.navigate(['/login']);
        } else {
          alert('Failed to load search history.');
        }
      },
    });
  }


}
