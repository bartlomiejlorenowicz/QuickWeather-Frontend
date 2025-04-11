import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
  ]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  message: string = '';
  // endpoint backendu zwraca JSON z tokenem resetu
  private apiUrl = 'http://localhost:8080/api/v1/user/auth/forgot-password';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email;
      // Zakładamy, że backend zwraca JSON z polem token
      this.http.post<{ token: string }>(this.apiUrl, { email }).subscribe({
        next: (response) => {
          // Przekierowanie do set-forgot-password z tokenem w query param
          this.router.navigate(['/set-new-password'], { queryParams: { token: response.token } });
        },
        error: (error) => {
          console.error('Error during password reset request:', error);
          this.message = error.error?.message || 'Wystąpił błąd. Spróbuj ponownie później.';
        }
      });
    }
  }
}
