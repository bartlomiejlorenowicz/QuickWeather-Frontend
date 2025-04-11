// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { AdminDataService } from '../../services/admin-data.service';
// import { AdminStatsResponse } from '../../models/admin.model';
//
// @Component({
//   selector: 'app-admin-dashboard',
//   templateUrl: './admin-dashboard.component.html',
//   styleUrls: ['./admin-dashboard.component.css']
// })
// export class AdminDashboardComponent implements OnInit {
//   activeUsersCount: number = 0;
//   totalUsers: number = 0;
//
//   constructor(
//     private router: Router,
//     private adminService: AdminService
//   ) {}
//
//   ngOnInit(): void {
//     console.log('AdminDashboardComponent zainicjalizowany');
//     this.loadStats();
//   }
//
//   loadStats(): void {
//     this.adminService.getDashboardStats().subscribe((stats: AdminStatsResponse) => {
//       console.log('Otrzymane statystyki:', stats);
//       this.activeUsersCount = stats.activeUsers;
//       this.totalUsers = stats.totalUsers;
//     }, error => {
//       console.error('Błąd pobierania statystyk:', error);
//     });
//   }
//
//
//   logout(): void {
//     localStorage.removeItem('token');
//     this.router.navigate(['/login']);
//   }
// }
