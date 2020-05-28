import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSmartCardComponent } from './task-smart-card.component';

describe('TaskSmartCardComponent', () => {
  let component: TaskSmartCardComponent;
  let fixture: ComponentFixture<TaskSmartCardComponent>;

  beforeEach(async(() => {
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
