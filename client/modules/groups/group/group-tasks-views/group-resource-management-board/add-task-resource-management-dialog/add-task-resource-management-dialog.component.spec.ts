import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddTaskResourceManagementDialogComponent } from './add-task-resource-management-dialog.component';

describe('AddTaskResourceManagementDialogComponent', () => {
  let component: AddTaskResourceManagementDialogComponent;
  let fixture: ComponentFixture<AddTaskResourceManagementDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTaskResourceManagementDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTaskResourceManagementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
