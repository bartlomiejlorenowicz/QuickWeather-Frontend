import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-account-locked-dialog',
  template: `
    <h2 mat-dialog-title>Konto zablokowane</h2>
    <mat-dialog-content>
      Twoje konto zostało zablokowane na 15 minut. Spróbuj ponownie później.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">OK</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class AccountLockedDialogComponent {
  constructor(public dialogRef: MatDialogRef<AccountLockedDialogComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
