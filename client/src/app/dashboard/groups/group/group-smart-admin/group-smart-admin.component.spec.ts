import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSmartAdminComponent } from './group-smart-admin.component';

describe('GroupSmartAdminComponent', () => {
  let component: GroupSmartAdminComponent;
  let fixture: ComponentFixture<GroupSmartAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupSmartAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSmartAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
