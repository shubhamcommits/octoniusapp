import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskSmartCardComponent } from './task-smart-card.component';

describe('TaskSmartCardComponent', () => {
  let component: TaskSmartCardComponent;
  let fixture: ComponentFixture<TaskSmartCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskSmartCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskSmartCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
