import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMemberPayrollDialogComponent } from './edit-member-payroll-dialog.component';

describe('EditMemberPayrollDialogComponent', () => {
  let component: EditMemberPayrollDialogComponent;
  let fixture: ComponentFixture<EditMemberPayrollDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditMemberPayrollDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMemberPayrollDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
