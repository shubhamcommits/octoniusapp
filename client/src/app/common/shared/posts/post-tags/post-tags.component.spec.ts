import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PostTagsComponent } from './post-tags.component';

describe('PostTagsComponent', () => {
  let component: PostTagsComponent;
  let fixture: ComponentFixture<PostTagsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PostTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
