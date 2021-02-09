import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUpdateUserInformationDialogComponent } from './user-update-user-information-dialog.component';

describe('UserUpdateUserInformationDialogComponent', () => {
  let component: UserUpdateUserInformationDialogComponent;
  let fixture: ComponentFixture<UserUpdateUserInformationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserUpdateUserInformationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserUpdateUserInformationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
