import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface UserActivityLog {
  userId: string;
  email: string;
  city: string;
  timestamp: string;
  activity: string;
}

@Component({
  selector: 'app-admin-activity-search',
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-activity-search-component.component.html',
  styleUrls: ['./admin-activity-search-component.component.css']
})
export class AdminActivitySearchComponent {
  searchParams = {
    userId: '',
    email: '',
    city: '',
    startDate: '',
    endDate: ''
  };

  results: UserActivityLog[] = [];

  constructor(private http: HttpClient) {}

  onSearch(): void {
    const params = {
      userId: this.searchParams.userId,
      email: this.searchParams.email,
      city: this.searchParams.city,
      startDate: this.searchParams.startDate,
      endDate: this.searchParams.endDate
    };

    this.http.get<UserActivityLog[]>('/api/v1/admin/user-activity', { params })
      .subscribe(
        data => {
          this.results = data;
        },
        error => {
          console.error('Error while searching:', error);
        }
      );
  }
}
