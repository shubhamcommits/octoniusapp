import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTaskForDayDialogComponent } from './user-task-for-day-dialog.component';

describe('UserTaskForDayDialogComponent', () => {
  let component: UserTaskForDayDialogComponent;
  let fixture: ComponentFixture<UserTaskForDayDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTaskForDayDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTaskForDayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
