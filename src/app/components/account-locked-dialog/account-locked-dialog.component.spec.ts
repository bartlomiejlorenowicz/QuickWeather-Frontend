import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountLockedDialogComponent } from './account-locked-dialog.component';

describe('AccountLockedDialogComponent', () => {
  let component: AccountLockedDialogComponent;
  let fixture: ComponentFixture<AccountLockedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountLockedDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountLockedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
