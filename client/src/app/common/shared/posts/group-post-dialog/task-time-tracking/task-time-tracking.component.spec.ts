import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskTimeTrackingComponent } from './task-time-tracking.component';

describe('TaskTimeTrackingComponent', () => {
  let component: TaskTimeTrackingComponent;
  let fixture: ComponentFixture<TaskTimeTrackingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskTimeTrackingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskTimeTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
