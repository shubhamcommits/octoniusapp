import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUpdateUserPersonalInformationDialogComponent } from './user-update-user-personal-information-dialog.component';

describe('UserUpdateUserPersonalInformationDialogComponent', () => {
  let component: UserUpdateUserPersonalInformationDialogComponent;
  let fixture: ComponentFixture<UserUpdateUserPersonalInformationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserUpdateUserPersonalInformationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserUpdateUserPersonalInformationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
