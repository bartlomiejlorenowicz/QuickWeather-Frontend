import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOverviewComponentComponent } from './admin-overview-component.component';

describe('AdminOverviewComponentComponent', () => {
  let component: AdminOverviewComponentComponent;
  let fixture: ComponentFixture<AdminOverviewComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOverviewComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOverviewComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
