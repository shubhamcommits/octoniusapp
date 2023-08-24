import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserProfileFieldsComponent } from './edit-user-profile-fields.component';

describe('EditUserProfileFieldsComponent', () => {
  let component: EditUserProfileFieldsComponent;
  let fixture: ComponentFixture<EditUserProfileFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditUserProfileFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditUserProfileFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
