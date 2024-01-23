import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTimeTrackingCategoriesDialogComponent } from './time-tracking-categories-dialog.component';

describe('GroupTimeTrackingCategoriesDialogComponent', () => {
  let component: GroupTimeTrackingCategoriesDialogComponent;
  let fixture: ComponentFixture<GroupTimeTrackingCategoriesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTimeTrackingCategoriesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTimeTrackingCategoriesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
