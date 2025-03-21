import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccountNavbarComponent } from './user-account-navbar.component';

describe('UserAccountNavbarComponent', () => {
  let component: UserAccountNavbarComponent;
  let fixture: ComponentFixture<UserAccountNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserAccountNavbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAccountNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
