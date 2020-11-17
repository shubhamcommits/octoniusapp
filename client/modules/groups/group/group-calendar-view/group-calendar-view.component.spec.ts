import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCalendarViewComponent } from './group-calendar-view.component';

describe('GroupCalendarViewComponent', () => {
  let component: GroupCalendarViewComponent;
  let fixture: ComponentFixture<GroupCalendarViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupCalendarViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCalendarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
