import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SecurityEvent {
  id: number;
  username: string;
  eventType: string;
  ipAddress: string;
  eventTime: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root',
})
export class SystemLogsService {
  private apiUrl = 'http://localhost:8080/api/v1/admin/logs';

  constructor(private http: HttpClient) {}

  getSecurityEvents(page: number = 0, size: number = 10): Observable<Page<SecurityEvent>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<SecurityEvent>>(this.apiUrl, { params });
  }
}
