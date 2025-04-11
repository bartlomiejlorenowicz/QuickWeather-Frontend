import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AccountLockedDialogComponent } from '../account-locked-dialog/account-locked-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterModule,
    MatSnackBarModule,
    MatDialogModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  private apiUrl = 'http://localhost:8080/api/v1/user/auth/login';
  errorMessage: string = '';
  isLoggedIn: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.updateLoginStatus();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.http.post<{ token: string }>(this.apiUrl, credentials).subscribe({
        next: (response) => {
          this.authService.saveToken(response.token);
          const user = this.authService.getUser();
          console.log('Decoded user:', user);
          if (user && user.roles && user.roles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/admin']);
          } else {
            // Użytkownik nie jest adminem – przekieruj do dashboardu
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          console.log('Error object:', err);
          let statusCode = err.status ? Number(err.status) : null;
          // Jeśli err.error jest obiektem i zawiera właściwość status
          if (!statusCode && err.error && typeof err.error === 'object' && err.error.status) {
            statusCode = Number(err.error.status);
          }
          if (!statusCode && typeof err.error === 'string' && err.error.toLowerCase().includes('locked')) {
            statusCode = 423;
          }
          if (statusCode === 423) {
            this.dialog.open(AccountLockedDialogComponent);
          } else {
            this.errorMessage = 'Invalid email or password. Please try again.';
            this.snackBar.open(this.errorMessage, 'OK', { duration: 5000, verticalPosition: 'top' });
          }
          console.error('Login error:', err);
        }
      });
    }
  }

  updateLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    console.log('Login status updated:', this.isLoggedIn);
  }

  login(): void {
    this.authService.saveToken('mock-token'); // Zapisz token w localStorage
    this.router.navigate(['/dashboard']); // Przejdź na dashboard
  }
}
