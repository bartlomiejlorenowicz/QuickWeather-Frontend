import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {CommonModule} from '@angular/common';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ErrorDialogComponent} from '../error-dialog/error-dialog.component';

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
    MatDialogModule,
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

  constructor(private http: HttpClient, private router: Router, private dialog: MatDialog) {}

  ngOnInit(): void {
    console.log('SearchHistoryComponent loaded.');
    this.loadHistory();
  }

  loadHistory(): void {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      this.dialog.open(ErrorDialogComponent, {
        data: { message: 'You must be logged in to view history.' },
        width: '300px'
      }).afterClosed().subscribe(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    const endpoint = `http://localhost:8080/api/v1/weather/history`;
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
        if (err.status === 401) {  // Obsługa błędu autoryzacji
          this.dialog.open(ErrorDialogComponent, {
            data: { message: 'Session expired. Please log in again.' },
            width: '300px'
          }).afterClosed().subscribe(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            this.router.navigate(['/login']);
          });
        } else {
          this.dialog.open(ErrorDialogComponent, {
            data: { message: 'Failed to load search history.' },
            width: '300px'
          });
        }
      },
    });
  }


}
