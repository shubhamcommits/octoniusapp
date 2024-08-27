import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMCompanyCustomFieldsComponent } from './crm-company-custom-fields.component';

describe('CRMCompanyCustomFieldsComponent', () => {
  let component: CRMCompanyCustomFieldsComponent;
  let fixture: ComponentFixture<CRMCompanyCustomFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMCompanyCustomFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCompanyCustomFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
