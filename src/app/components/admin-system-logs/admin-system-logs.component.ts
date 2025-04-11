import {Component, OnInit, ViewChild} from '@angular/core';
import {SystemLogsService, SecurityEvent, Page} from '../../services/SystemLogsService';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule, PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-system-logs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatPaginatorModule],
  templateUrl: './admin-system-logs.component.html',
  styleUrls: ['./admin-system-logs.component.css']
})
export class SystemLogsComponent implements OnInit {
  logs: SecurityEvent[] = [];
  error: string = '';
  totalElements: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;

  constructor(private logsService: SystemLogsService) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadLogs(this.currentPage, this.pageSize);
  }

  loadLogs(page: number, size: number): void {
    this.logsService.getSecurityEvents(page, size).subscribe({
      next: (data: Page<SecurityEvent>) => {
        this.logs = data.content;
        this.totalElements = data.totalElements;
        this.currentPage = data.number;
      },
      error: (err) => {
        console.error('Error fetching logs:', err);
        this.error = 'Failed to load logs';
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.loadLogs(event.pageIndex, event.pageSize);
  }

}
