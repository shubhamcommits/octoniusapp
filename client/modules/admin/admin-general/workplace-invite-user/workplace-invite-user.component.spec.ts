import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceInviteUserComponent } from './workplace-invite-user.component';

describe('WorkplaceInviteUserComponent', () => {
  let component: WorkplaceInviteUserComponent;
  let fixture: ComponentFixture<WorkplaceInviteUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplaceInviteUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceInviteUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
