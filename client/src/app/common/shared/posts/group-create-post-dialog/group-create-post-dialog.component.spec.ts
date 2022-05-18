import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupCreatePostDialogComponent } from './group-create-post-dialog.component';

describe('GroupCreatePostDialogComponent', () => {
  let component: GroupCreatePostDialogComponent;
  let fixture: ComponentFixture<GroupCreatePostDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupCreatePostDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCreatePostDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
