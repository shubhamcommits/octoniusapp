import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupKanbanBoardsComponent } from './group-kanban-boards.component';

describe('GroupKanbanBoardsComponent', () => {
  let component: GroupKanbanBoardsComponent;
  let fixture: ComponentFixture<GroupKanbanBoardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupKanbanBoardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupKanbanBoardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
