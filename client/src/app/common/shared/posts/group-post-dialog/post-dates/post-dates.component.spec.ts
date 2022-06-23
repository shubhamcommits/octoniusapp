import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PostDatesComponent } from './post-dates.component';

describe('PostDatesComponent', () => {
  let component: PostDatesComponent;
  let fixture: ComponentFixture<PostDatesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PostDatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
