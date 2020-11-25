import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LikePostComponent } from './like-post.component';

describe('LikePostComponent', () => {
  let component: LikePostComponent;
  let fixture: ComponentFixture<LikePostComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LikePostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LikePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
