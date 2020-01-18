import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTasksNewComponent } from './group-tasks-new.component';

describe('GroupTasksNewComponent', () => {
  let component: GroupTasksNewComponent;
  let fixture: ComponentFixture<GroupTasksNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTasksNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTasksNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
