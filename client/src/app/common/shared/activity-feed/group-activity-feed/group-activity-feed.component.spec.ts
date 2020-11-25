import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupActivityFeedComponent } from './group-activity-feed.component';

describe('GroupActivityFeedComponent', () => {
  let component: GroupActivityFeedComponent;
  let fixture: ComponentFixture<GroupActivityFeedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupActivityFeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupActivityFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
