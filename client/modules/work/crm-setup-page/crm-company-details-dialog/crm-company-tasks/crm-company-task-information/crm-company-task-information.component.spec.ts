import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CRMCompanyTaskInformationComponent } from "./crm-company-task-information.component";

describe("CRMCompanyTaskInformationComponent", () => {
  let component: CRMCompanyTaskInformationComponent;
  let fixture: ComponentFixture<CRMCompanyTaskInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CRMCompanyTaskInformationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCompanyTaskInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
