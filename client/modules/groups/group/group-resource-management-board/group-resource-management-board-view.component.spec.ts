import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupResourceManagementBoardViewComponent } from './group-resource-management-board-view.component';

describe('GroupResourceManagementBoardViewComponent', () => {
  let component: GroupResourceManagementBoardViewComponent;
  let fixture: ComponentFixture<GroupResourceManagementBoardViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupResourceManagementBoardViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupResourceManagementBoardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
