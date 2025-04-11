import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-request-reset-password',
  templateUrl: './request-reset-password.component.html',
  styleUrls: ['./request-reset-password.component.css'],
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule
  ],
})
export class RequestResetPasswordComponent {
  resetPasswordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  private apiUrl = 'http://localhost:8080/api/v1/user/auth/forgot-password';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const email = this.resetPasswordForm.value.email;

      this.http.post(this.apiUrl, { email }).subscribe({
        next: (response: any) => {
          this.successMessage = response.message || 'Check your email for the reset link.';
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage = 'Failed to send reset link. Please try again.';
          this.successMessage = '';
        },
      });
    }
  }
}
