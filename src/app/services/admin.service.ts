// admin-data.service.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import { AdminStatsResponse, User } from '../models/admin.model';
import {AdminUserDTO} from '../models/admin-user.dto';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private baseUrl = 'http://localhost:8080/api/v1/admin';

  constructor(private http: HttpClient) {}

  // Pobiera statystyki dashboardu
  getDashboardStats(): Observable<AdminStatsResponse> {
    return this.http.get<AdminStatsResponse>(`${this.baseUrl}/stats`);
  }

  // Pobiera wszystkich użytkowników z paginacją oraz opcjonalnym wyszukiwaniem po email
  getAllUsers(page?: number, size?: number, sort?: string, email?: string): Observable<AdminUserDTO[]> {
    let params = new HttpParams();
    if (page !== undefined) {
      params = params.set('page', page.toString());
    }
    if (size !== undefined) {
      params = params.set('size', size.toString());
    }
    if (sort !== undefined) {
      params = params.set('sort', sort);
    }
    if (email && email.trim().length > 0) {
      params = params.set('email', email);
    }
    return this.http.get<any>(`${this.baseUrl}/users`, { params }).pipe(
      map(response => response.content as AdminUserDTO[])
    );
  }

  // Aktualizuje status użytkownika
  updateUserStatus(userId: number, enabled: boolean): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}/status?enabled=${enabled}`, null);
  }

}
