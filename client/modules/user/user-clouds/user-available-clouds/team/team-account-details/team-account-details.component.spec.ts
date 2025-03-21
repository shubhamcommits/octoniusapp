import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamAccountDetailsComponent } from './team-account-details.component';

describe('TeamAccountDetailsComponent', () => {
  let component: TeamAccountDetailsComponent;
  let fixture: ComponentFixture<TeamAccountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamAccountDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
