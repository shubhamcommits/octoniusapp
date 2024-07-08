import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PostLogsComponent } from './post-logs.component';

describe('PostLogsComponent', () => {
  let component: PostLogsComponent;
  let fixture: ComponentFixture<PostLogsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PostLogsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
