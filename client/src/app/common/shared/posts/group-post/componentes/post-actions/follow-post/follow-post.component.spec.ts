import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FollowPostComponent } from './follow-post.component';

describe('FollowPostComponent', () => {
  let component: FollowPostComponent;
  let fixture: ComponentFixture<FollowPostComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FollowPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
