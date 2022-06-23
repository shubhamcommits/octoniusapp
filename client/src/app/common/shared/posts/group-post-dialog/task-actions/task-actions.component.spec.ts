import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskActionsComponent } from './task-actions.component';

describe('TaskActionsComponent', () => {
  let component: TaskActionsComponent;
  let fixture: ComponentFixture<TaskActionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
