import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoneTasksListViewComponent } from './done-tasks-list-view.component';

describe('DoneTasksListViewComponent', () => {
  let component: DoneTasksListViewComponent;
  let fixture: ComponentFixture<DoneTasksListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoneTasksListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoneTasksListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
