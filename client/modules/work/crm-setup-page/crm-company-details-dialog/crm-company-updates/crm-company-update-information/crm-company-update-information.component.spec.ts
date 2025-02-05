import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CRMCompanyUpdateInformationComponent } from "./crm-company-update-information.component";

describe("CRMCompanyUpdateInformationComponent", () => {
  let component: CRMCompanyUpdateInformationComponent;
  let fixture: ComponentFixture<CRMCompanyUpdateInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CRMCompanyUpdateInformationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCompanyUpdateInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
