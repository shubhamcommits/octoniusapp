import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoneTasksKanbanViewComponent } from './done-tasks-kanban-view.component';

describe('DoneTasksKanbanViewComponent', () => {
  let component: DoneTasksKanbanViewComponent;
  let fixture: ComponentFixture<DoneTasksKanbanViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoneTasksKanbanViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoneTasksKanbanViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
