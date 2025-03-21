import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CRMCompanyDetailsComponent } from "./crm-company-details.component";

describe("CRMCompanyDetailsComponent", () => {
  let component: CRMCompanyDetailsComponent;
  let fixture: ComponentFixture<CRMCompanyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CRMCompanyDetailsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCompanyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
