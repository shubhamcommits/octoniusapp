import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupCreatePostComponent } from './group-create-post.component';

describe('GroupCreatePostComponent', () => {
  let component: GroupCreatePostComponent;
  let fixture: ComponentFixture<GroupCreatePostComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupCreatePostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCreatePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
