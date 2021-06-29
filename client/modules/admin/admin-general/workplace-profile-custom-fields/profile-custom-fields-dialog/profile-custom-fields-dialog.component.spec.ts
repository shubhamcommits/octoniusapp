import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCustomFieldsDialogComponent } from './profile-custom-fields-dialog.component';

describe('ProfileCustomFieldsDialogComponent', () => {
  let component: ProfileCustomFieldsDialogComponent;
  let fixture: ComponentFixture<ProfileCustomFieldsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileCustomFieldsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileCustomFieldsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
