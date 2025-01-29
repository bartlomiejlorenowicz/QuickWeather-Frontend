import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterModule
  ]
})
export class RegisterComponent {
  registerForm!: FormGroup;

  private static EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  private static PASSWORD_SPECIAL_CHARACTER = /[!@#$%^&*(),.?":{}|<>]/;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
        lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
        email: ['', [Validators.required, Validators.pattern(RegisterComponent.EMAIL_REGEX)]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(RegisterComponent.PASSWORD_SPECIAL_CHARACTER),
          ],
        ],
        confirmPassword: ['', Validators.required],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: any): any {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  isLoading = false;

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true; // Rozpocznij ładowanie
      const user = this.registerForm.value;
      this.http.post('http://localhost:8080/api/v1/user/register', user).subscribe({
        next: () => {
          alert('User registered successfully!');
          this.isLoading = false; // Zakończ ładowanie
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error occurred during registration:', err);
          alert('Registration failed. Please try again.');
          this.isLoading = false;
        }
      });
    }
  }

}
