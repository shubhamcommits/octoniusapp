import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupKanbanTaskViewComponent } from './group-kanban-task-view.component';

describe('GroupKanbanTaskViewComponent', () => {
  let component: GroupKanbanTaskViewComponent;
  let fixture: ComponentFixture<GroupKanbanTaskViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupKanbanTaskViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupKanbanTaskViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
