import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AdminDataService } from '../../services/admin.service';
import { AdminUserDTO } from '../../models/admin-user.dto';
import {UserAccountStatusService} from '../../services/UserAccountStatusService';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: AdminUserDTO[] = [];
  errorMessage: string = '';

  page: number = 0;
  size: number = 10;
  searchEmail: string = '';

  constructor(private adminDataService: AdminDataService,
              private userAccountStatusService: UserAccountStatusService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminDataService.getAllUsers(this.page, this.size, 'id', this.searchEmail).subscribe({
      next: (data: AdminUserDTO[]) => {
        this.users = data;
      },
      error: (error: any) => {
        this.errorMessage = 'Wystąpił błąd podczas pobierania danych';
        console.error(error);
      }
    });
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    this.page++;
    this.loadUsers();
  }

  toggleStatus(user: AdminUserDTO): void {
    const newStatus = !user.enabled;
    this.userAccountStatusService.updateAccountStatus(user.id, newStatus).subscribe({
      next: () => {
        user.enabled = newStatus;
      },
      error: (error: any) => {
        console.error('Error updating user status:', error);
      }
    });
  }

  isUnlockable(user: AdminUserDTO): boolean {
    if (!user.lockUntil) return false;
    const lockUntilDate = new Date(user.lockUntil);
    const currentDate = new Date();
    return lockUntilDate <= currentDate;
  }

}
