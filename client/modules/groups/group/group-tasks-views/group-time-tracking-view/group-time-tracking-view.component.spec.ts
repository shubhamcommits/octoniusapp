import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTimeTrackingViewComponent } from './group-time-tracking-view.component';

describe('GroupTimeTrackingViewComponent', () => {
  let component: GroupTimeTrackingViewComponent;
  let fixture: ComponentFixture<GroupTimeTrackingViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTimeTrackingViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTimeTrackingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
