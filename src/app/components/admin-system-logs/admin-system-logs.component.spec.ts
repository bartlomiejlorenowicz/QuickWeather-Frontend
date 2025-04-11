import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSystemLogsComponent } from './admin-system-logs.component';

describe('AdminSystemLogsComponent', () => {
  let component: AdminSystemLogsComponent;
  let fixture: ComponentFixture<AdminSystemLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSystemLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSystemLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
