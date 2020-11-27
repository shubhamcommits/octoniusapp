import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthSlackComponent } from './auth-slack.component';

describe('AuthSlackComponent', () => {
  let component: AuthSlackComponent;
  let fixture: ComponentFixture<AuthSlackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthSlackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthSlackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
