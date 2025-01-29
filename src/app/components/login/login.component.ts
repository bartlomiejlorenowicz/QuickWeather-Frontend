import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {AuthService} from '../../auth.service';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

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
    private router: Router
  ) {
  }

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

      this.http.post<{ token: string }>('http://localhost:8080/api/v1/user/auth/login', credentials).subscribe({
        next: (response) => {
          this.authService.saveToken(response.token); // Zapisz token
          this.router.navigate(['/dashboard']); // Przekieruj do Dashboard
        },
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = 'Invalid email or password. Please try again.';
        },
      });
    }
  }

  updateLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    console.log('Login status updated:', this.isLoggedIn);
  }

  login(): void {
    // Przykład logowania (symulacja zapisu tokena)
    this.authService.saveToken('mock-token'); // Zapisz token w localStorage
    this.router.navigate(['/dashboard']); // Przejdź na dashboard
  }



}
