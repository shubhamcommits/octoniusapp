import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NewTimeTrackingDialogComponent } from './new-time-tracking-dialog.component';

describe('NewTimeTrackingDialogComponent', () => {
  let component: NewTimeTrackingDialogComponent;
  let fixture: ComponentFixture<NewTimeTrackingDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NewTimeTrackingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTimeTrackingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
