import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamAuthConfirmationComponent } from './team-auth-confirmation.component';

describe('TeamAuthConfirmationComponent', () => {
  let component: TeamAuthConfirmationComponent;
  let fixture: ComponentFixture<TeamAuthConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamAuthConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamAuthConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
