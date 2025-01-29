import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-set-new-password',
  standalone: true,
  templateUrl: './set-new-password.component.html',
  styleUrls: ['./set-new-password.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class SetNewPasswordComponent {
  password: string = '';
  token: string = '';
  apiBaseUrl: string = 'http://localhost:8080/api/v1/user/auth/set-new-password';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['token']) {
        this.token = params['token'];
      }
    });
  }

  onSubmit(): void {
    const payload = { password: this.password, token: this.token };

    this.http.post(this.apiBaseUrl, payload).subscribe({
      next: (response) => {
        alert('Password updated successfully!');
        this.router.navigate(['/login']); // Przekierowanie na stronę logowania
      },
      error: (error) => {
        console.error('Error updating password:', error);
        alert('Failed to update password. Please try again.');
      }
    });
  }


}


