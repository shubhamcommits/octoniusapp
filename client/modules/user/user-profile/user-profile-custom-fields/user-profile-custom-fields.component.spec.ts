import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileCustomFieldsComponent } from './user-profile-custom-fields.component';

describe('UserProfileCustomFieldsComponent', () => {
  let component: UserProfileCustomFieldsComponent;
  let fixture: ComponentFixture<UserProfileCustomFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserProfileCustomFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileCustomFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
