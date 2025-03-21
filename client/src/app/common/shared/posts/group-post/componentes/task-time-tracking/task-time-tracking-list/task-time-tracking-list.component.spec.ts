import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskTimeTrackingListComponent } from './task-time-tracking-list.component';

describe('TaskTimeTrackingListComponent', () => {
  let component: TaskTimeTrackingListComponent;
  let fixture: ComponentFixture<TaskTimeTrackingListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskTimeTrackingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskTimeTrackingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
