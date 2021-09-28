import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupKanbanArchivedBoardsComponent } from './group-kanban-archived-boards.component';

describe('GroupKanbanArchivedBoardsComponent', () => {
  let component: GroupKanbanArchivedBoardsComponent;
  let fixture: ComponentFixture<GroupKanbanArchivedBoardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupKanbanArchivedBoardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupKanbanArchivedBoardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
