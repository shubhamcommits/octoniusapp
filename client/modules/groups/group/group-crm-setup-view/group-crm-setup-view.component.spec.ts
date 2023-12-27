import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCRMSetupViewComponent } from './group-crm-setup-view.component';

describe('GroupCRMSetupViewComponent', () => {
  let component: GroupCRMSetupViewComponent;
  let fixture: ComponentFixture<GroupCRMSetupViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupCRMSetupViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCRMSetupViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
