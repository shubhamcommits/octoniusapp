import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskDialogComponent } from './task-dialog.component';

describe('TaskDialogComponent', () => {
  let component: TaskDialogComponent;
  let fixture: ComponentFixture<TaskDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
