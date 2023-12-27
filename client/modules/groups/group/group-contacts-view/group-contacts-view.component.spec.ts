import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupContactsViewComponent } from './group-contacts-view.component';

describe('GroupContactsViewComponent', () => {
  let component: GroupContactsViewComponent;
  let fixture: ComponentFixture<GroupContactsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupContactsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupContactsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
