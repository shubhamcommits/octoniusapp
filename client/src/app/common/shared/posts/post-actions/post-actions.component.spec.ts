import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PostActionsComponent } from './post-actions.component';

describe('PostActionsComponent', () => {
  let component: PostActionsComponent;
  let fixture: ComponentFixture<PostActionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PostActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
