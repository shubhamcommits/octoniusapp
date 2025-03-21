import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PostUtilsComponent } from './post-utils.component';

describe('PostUtilsComponent', () => {
  let component: PostUtilsComponent;
  let fixture: ComponentFixture<PostUtilsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PostUtilsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostUtilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
