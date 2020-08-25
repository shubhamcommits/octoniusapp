import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoneTasksListViewComponentComponent } from './done-tasks-list-view-component.component';

describe('DoneTasksListViewComponentComponent', () => {
  let component: DoneTasksListViewComponentComponent;
  let fixture: ComponentFixture<DoneTasksListViewComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoneTasksListViewComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoneTasksListViewComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
