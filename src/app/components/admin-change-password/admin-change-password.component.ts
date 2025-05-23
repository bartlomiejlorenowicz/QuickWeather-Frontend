import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-change-password',
  standalone: true,
  templateUrl: './admin-change-password.component.html',
  styleUrls: ['./admin-change-password.component.css'],
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
})
export class AdminChangePasswordComponent {
  changePasswordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  private apiUrl = 'http://localhost:8080/api/v1/admin/change-password';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
      const token = localStorage.getItem('token'); // Pobieramy token JWT z localStorage

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      this.http.post(this.apiUrl, { currentPassword, newPassword, confirmPassword }, { headers })
        .subscribe({
          next: (response: any) => {
            this.successMessage = response.message || 'Password changed successfully!';
            this.errorMessage = '';
            this.changePasswordForm.reset();
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Error changing password:', error);
            this.errorMessage = error.error.message || 'Error changing password.';
          }
        });
    }
  }
}
