import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupPostDialogComponent } from './group-post-dialog.component';

describe('GroupPostDialogComponent', () => {
  let component: GroupPostDialogComponent;
  let fixture: ComponentFixture<GroupPostDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupPostDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupPostDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
