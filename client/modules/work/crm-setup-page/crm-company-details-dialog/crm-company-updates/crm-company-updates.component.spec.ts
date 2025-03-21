import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CRMCompanyUpdatesComponent } from "./crm-company-updates.component";

describe("CRMCompanyUpdatesComponent", () => {
  let component: CRMCompanyUpdatesComponent;
  let fixture: ComponentFixture<CRMCompanyUpdatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CRMCompanyUpdatesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCompanyUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
