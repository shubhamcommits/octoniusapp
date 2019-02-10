import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupPostComponent } from './task-group-post.component';

describe('TaskGroupPostComponent', () => {
  let component: TaskGroupPostComponent;
  let fixture: ComponentFixture<TaskGroupPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskGroupPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskGroupPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
