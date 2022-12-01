import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAvailabilityDayDialogComponent } from './user-availability-day-dialog.component';

describe('UserAvailabilityDayDialogComponent', () => {
  let component: UserAvailabilityDayDialogComponent;
  let fixture: ComponentFixture<UserAvailabilityDayDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserAvailabilityDayDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAvailabilityDayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
