import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentOnPostComponent } from './comment-on-post.component';

describe('CommentOnPostComponent', () => {
  let component: CommentOnPostComponent;
  let fixture: ComponentFixture<CommentOnPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentOnPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentOnPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
