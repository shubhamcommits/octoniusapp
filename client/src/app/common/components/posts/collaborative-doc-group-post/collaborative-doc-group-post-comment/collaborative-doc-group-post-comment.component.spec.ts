import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborativeDocGroupPostCommentComponent } from './collaborative-doc-group-post-comment.component';

describe('CollaborativeDocGroupPostCommentComponent', () => {
  let component: CollaborativeDocGroupPostCommentComponent;
  let fixture: ComponentFixture<CollaborativeDocGroupPostCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaborativeDocGroupPostCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborativeDocGroupPostCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
