import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupResourceManagementComponent } from './group-resource-management.component';

describe('GroupResourceManagementComponent', () => {
  let component: GroupResourceManagementComponent;
  let fixture: ComponentFixture<GroupResourceManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupResourceManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupResourceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
