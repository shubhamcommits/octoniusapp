import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthUserDetailsComponent } from './auth-user-details.component';

describe('AuthUserDetailsComponent', () => {
  let component: AuthUserDetailsComponent;
  let fixture: ComponentFixture<AuthUserDetailsComponent>;

  beforeEach(async(() => {
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
