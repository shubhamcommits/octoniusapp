import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthNewWorkplaceComponent } from './auth-new-workplace.component';

describe('AuthNewWorkplaceComponent', () => {
  let component: AuthNewWorkplaceComponent;
  let fixture: ComponentFixture<AuthNewWorkplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthNewWorkplaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthNewWorkplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
