import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsPageHeaderComponent } from './groups-page-header.component';

describe('GroupsPageHeaderComponent', () => {
  let component: GroupsPageHeaderComponent;
  let fixture: ComponentFixture<GroupsPageHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsPageHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsPageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
