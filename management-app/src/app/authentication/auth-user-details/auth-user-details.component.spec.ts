import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AuthUserDetailsComponent } from './auth-user-details.component';

describe('AuthUserDetailsComponent', () => {
  let component: AuthUserDetailsComponent;
  let fixture: ComponentFixture<AuthUserDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthUserDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthUserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
