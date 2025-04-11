import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminActivitySearchComponentComponent } from './admin-activity-search-component.component';

describe('AdminActivitySearchComponentComponent', () => {
  let component: AdminActivitySearchComponentComponent;
  let fixture: ComponentFixture<AdminActivitySearchComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminActivitySearchComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminActivitySearchComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
