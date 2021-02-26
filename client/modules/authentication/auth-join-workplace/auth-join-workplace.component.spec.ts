import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthJoinWorkplaceComponent } from './auth-join-workplace.component';

describe('AuthJoinWorkplaceComponent', () => {
  let component: AuthJoinWorkplaceComponent;
  let fixture: ComponentFixture<AuthJoinWorkplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthJoinWorkplaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthJoinWorkplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
