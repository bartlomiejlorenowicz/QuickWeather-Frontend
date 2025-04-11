import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserAccountStatusService {
  private statusUrl = 'http://localhost:8080/api/v1/user/account-status';

  constructor(private http: HttpClient) {}

  updateAccountStatus(userId: number, enabled: boolean): Observable<any> {
    const url = enabled
      ? `/api/v1/admin/users/${userId}/enable`
      : `/api/v1/admin/users/${userId}/disable`;
    return this.http.patch(url, {});
  }

  unblockUser(userId: number): Observable<any> {
    const url = `/api/v1/admin/users/${userId}/unblock`;
    return this.http.patch(url, {});
  }
}
