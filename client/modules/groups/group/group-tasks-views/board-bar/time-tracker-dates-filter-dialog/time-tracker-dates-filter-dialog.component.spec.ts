import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTrackerDatesFilterDialogComponent } from './time-tracker-dates-filter-dialog.component';

describe('TimeTrackerDatesFilterDialogComponent', () => {
  let component: TimeTrackerDatesFilterDialogComponent;
  let fixture: ComponentFixture<TimeTrackerDatesFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeTrackerDatesFilterDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeTrackerDatesFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
