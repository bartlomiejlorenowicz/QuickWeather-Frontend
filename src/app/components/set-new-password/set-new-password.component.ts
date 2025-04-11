import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-set-new-password',
  standalone: true,
  templateUrl: './set-new-password.component.html',
  styleUrls: ['./set-new-password.component.css'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class SetNewPasswordComponent {
  setNewPasswordForm: FormGroup;
  token: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  private apiUrl = 'http://localhost:8080/api/v1/user/auth/set-new-password';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.setNewPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
    });
  }

  onSubmit(): void {
    if (this.setNewPasswordForm.valid) {
      const { newPassword, confirmPassword } = this.setNewPasswordForm.value;

      this.http
        .post(this.apiUrl, { token: this.token, newPassword, confirmPassword })
        .subscribe({
          next: (response: any) => {
            this.successMessage =
              response.message || 'Password updated successfully!';
            this.errorMessage = '';
            this.setNewPasswordForm.reset();
          },
          error: (error) => {
            console.error('Error setting new password:', error);
            this.errorMessage =
              error.error.message || 'Error setting new password.';
          },
        });
    }
  }
}
