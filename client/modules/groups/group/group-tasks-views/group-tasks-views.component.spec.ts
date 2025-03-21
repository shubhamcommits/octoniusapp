import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTasksViewsComponent } from './group-tasks-views.component';

describe('GroupTasksViewsComponent', () => {
  let component: GroupTasksViewsComponent;
  let fixture: ComponentFixture<GroupTasksViewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTasksViewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTasksViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
