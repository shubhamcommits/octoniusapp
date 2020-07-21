import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTasksListViewComponent } from './group-tasks-list-view.component';

describe('GroupTasksListViewComponent', () => {
  let component: GroupTasksListViewComponent;
  let fixture: ComponentFixture<GroupTasksListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTasksListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTasksListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
