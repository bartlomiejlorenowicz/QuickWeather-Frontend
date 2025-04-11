import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-set-forgot-password',
  templateUrl: './set-forgot-password.component.html',
  styleUrls: ['./set-forgot-password.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule
  ]
})
export class SetForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  token: string = '';
  private apiUrl = 'http://localhost:8080/api/v1/user/auth/set-new-password';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Utwórz formularz z walidatorem, który sprawdza zgodność haseł
    this.forgotPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    // Pobierz token z parametrów URL (np. ?token=XYZ)
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  // Niestandardowy walidator, który sprawdza, czy nowe hasło i potwierdzenie są takie same
  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      const { newPassword, confirmPassword } = this.forgotPasswordForm.value;
      this.http.post<{ message: string }>(
        this.apiUrl,
        { token: this.token, newPassword, confirmPassword }
      ).subscribe({
        next: (response) => {
          this.successMessage = response.message || 'Password updated successfully!';
          this.errorMessage = '';
          this.forgotPasswordForm.reset();
          // Opcjonalnie: przekieruj użytkownika do logowania
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error setting new password:', error);
          this.errorMessage = error.error.message || 'Error setting new password. Please try again.';
        }
      });
    }
  }
}
