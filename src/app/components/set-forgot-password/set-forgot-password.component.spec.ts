import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetForgotPasswordComponent } from './set-forgot-password.component';

describe('SetForgotPasswordComponent', () => {
  let component: SetForgotPasswordComponent;
  let fixture: ComponentFixture<SetForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetForgotPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
