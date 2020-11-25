import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LikeCommentComponent } from './like-comment.component';

describe('LikeCommentComponent', () => {
  let component: LikeCommentComponent;
  let fixture: ComponentFixture<LikeCommentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LikeCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LikeCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
