import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { CRMCompanyTasksComponent } from "./crm-company-tasks.component";

describe("CRMCompanyTasksComponent", () => {
  let component: CRMCompanyTasksComponent;
  let fixture: ComponentFixture<CRMCompanyTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CRMCompanyTasksComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCompanyTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
