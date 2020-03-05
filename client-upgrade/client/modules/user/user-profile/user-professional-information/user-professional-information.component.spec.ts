import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfessionalInformationComponent } from './user-professional-information.component';

describe('UserProfessionalInformationComponent', () => {
  let component: UserProfessionalInformationComponent;
  let fixture: ComponentFixture<UserProfessionalInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserProfessionalInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfessionalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
