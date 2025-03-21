import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMContactCompaniesComponent } from './crm-contact-companies.component';

describe('CRMContactCompaniesComponent', () => {
  let component: CRMContactCompaniesComponent;
  let fixture: ComponentFixture<CRMContactCompaniesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMContactCompaniesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMContactCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
