import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-oauth-callback',
  template: '<p>Logging in...</p>',
})
export class OAuthCallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token']; // Token JWT z backendu
      if (token) {
        this.authService.saveToken(token); // Zapisz token w localStorage
        console.log('Logged in successfully!');
      } else {
        console.error('No token received!');
      }
    });
  }
}
