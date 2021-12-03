import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FollowStoryComponent } from './follow-story.component';

describe('FollowStoryComponent', () => {
  let component: FollowStoryComponent;
  let fixture: ComponentFixture<FollowStoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FollowStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
