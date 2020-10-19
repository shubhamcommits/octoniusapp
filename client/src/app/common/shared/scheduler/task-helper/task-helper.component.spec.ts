import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskHelperComponent } from './task-helper.component';

describe('TaskHelperComponent', () => {
  let component: TaskHelperComponent;
  let fixture: ComponentFixture<TaskHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskHelperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
