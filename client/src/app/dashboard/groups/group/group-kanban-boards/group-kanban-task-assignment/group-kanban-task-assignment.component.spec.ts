import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupKanbanTaskAssignmentComponent } from './group-kanban-task-assignment.component';

describe('GroupKanbanTaskAssignmentComponent', () => {
  let component: GroupKanbanTaskAssignmentComponent;
  let fixture: ComponentFixture<GroupKanbanTaskAssignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupKanbanTaskAssignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupKanbanTaskAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
