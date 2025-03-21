import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWorkloadCalendarComponent } from './user-workload-calendar.component';

describe('UserWorkloadCalendarComponent', () => {
  let component: UserWorkloadCalendarComponent;
  let fixture: ComponentFixture<UserWorkloadCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserWorkloadCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserWorkloadCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
