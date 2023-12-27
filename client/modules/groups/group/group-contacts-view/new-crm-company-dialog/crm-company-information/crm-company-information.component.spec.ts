import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMCompanyInformationComponent } from './crm-company-information.component';

describe('CRMCompanyInformationComponent', () => {
  let component: CRMCompanyInformationComponent;
  let fixture: ComponentFixture<CRMCompanyInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMCompanyInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCompanyInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
