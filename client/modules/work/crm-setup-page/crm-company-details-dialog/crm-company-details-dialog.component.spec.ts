import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CRMCompanyDetailsDialogComponent } from "./crm-company-details-dialog.component";

describe("CRMCompanyDetailsDialogComponent", () => {
  let component: CRMCompanyDetailsDialogComponent;
  let fixture: ComponentFixture<CRMCompanyDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CRMCompanyDetailsDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCompanyDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
