import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CRMTaskDialogComponent } from './crm-task-dialog.component';

describe('CRMTaskDialogComponent', () => {
  let component: CRMTaskDialogComponent;
  let fixture: ComponentFixture<CRMTaskDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMTaskDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMTaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
