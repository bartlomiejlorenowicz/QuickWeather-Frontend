import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {Router, RouterModule} from '@angular/router';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

export function nameValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const trimmedValue = control.value.trim();
  if (trimmedValue.length === 0) {
    return { whitespace: 'Name cannot be only whitespace' };
  }

  const nameRegex = /^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż\-]+$/;
  if (!nameRegex.test(trimmedValue)) {
    return { invalidName: 'Name contains invalid characters' };
  }
  return null;
}

export function lastNameValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const trimmedValue = control.value.trim();
  if (trimmedValue.length === 0) {
    return { whitespace: 'Last name cannot be only whitespace' };
  }

  const lastNameRegex = /^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż\-\']+(?:\s[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż\-\']+)*$/;
  if (!lastNameRegex.test(trimmedValue)) {
    return { invalidLastName: 'Last name contains invalid characters' };
  }
  return null;
}

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
    RouterModule,
    MatSnackBarModule,
  ]
})
export class RegisterComponent {
  registerForm!: FormGroup;

  private static EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  private static PASSWORD_SPECIAL_CHARACTER = /[!@#$%^&*(),.?":{}|<>]/;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, nameValidator, Validators.minLength(2), Validators.maxLength(30)]],
        lastName: ['', [Validators.required, lastNameValidator, Validators.minLength(2), Validators.maxLength(30)]],
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
      this.isLoading = true;
      const user = this.registerForm.value;
      this.http.post('http://localhost:8080/api/v1/user/register', user).subscribe({
        next: () => {
          this.snackBar.open('User registered successfully!', 'OK', {
            duration: 4000, verticalPosition: "top",
            panelClass: ['snackbar-success']
          });
          this.isLoading = false;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error occurred during registration:', err);
          this.snackBar.open('Registration failed. Please try again.', 'OK', {
            duration: 4000,
            panelClass: ['snackbar-error']
          });
          this.isLoading = false;
        }
      });
    }
  }

}
