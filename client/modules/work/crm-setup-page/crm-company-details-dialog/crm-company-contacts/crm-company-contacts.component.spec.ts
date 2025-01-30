import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CRMCompanyContactsComponent } from "./crm-company-contacts.component";

describe("CRMCompanyContactsComponent", () => {
  let component: CRMCompanyContactsComponent;
  let fixture: ComponentFixture<CRMCompanyContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CRMCompanyContactsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCompanyContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
