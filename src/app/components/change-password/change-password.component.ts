import { Component } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
  ],
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  private apiUrl = 'http://localhost:8080/api/v1/user/auth/change-password';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      const payload = this.changePasswordForm.value;
      const token = localStorage.getItem('token'); // Pobierz token JWT

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Dodanie tokena JWT
      });

      this.http.post(this.apiUrl, payload, { headers }).subscribe({
        next: () => {
          this.successMessage = 'Password changed successfully!';
          this.errorMessage = '';

          // Opcjonalnie: przekierowanie do logowania
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (error) => {
          console.error('Error changing password:', error);

          if (error.status === 401) {
            this.errorMessage = 'Session expired. Please log in again.';
            setTimeout(() => this.router.navigate(['/login']), 2000);
          } else {
            this.errorMessage = 'Failed to change password. Please try again.';
          }
          this.successMessage = '';
        },
      });
    }
  }
}
