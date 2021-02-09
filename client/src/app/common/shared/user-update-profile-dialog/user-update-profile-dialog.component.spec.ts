import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUpdateProfileDialogComponent } from './user-update-profile-dialog.component';

describe('UserUpdateProfileDialogComponent', () => {
  let component: UserUpdateProfileDialogComponent;
  let fixture: ComponentFixture<UserUpdateProfileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserUpdateProfileDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserUpdateProfileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
