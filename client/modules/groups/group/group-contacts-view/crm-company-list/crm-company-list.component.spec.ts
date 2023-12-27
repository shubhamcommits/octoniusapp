import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMCompanyListComponent } from './crm-company-list.component';

describe('CRMCompanyListComponent', () => {
  let component: CRMCompanyListComponent;
  let fixture: ComponentFixture<CRMCompanyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMCompanyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCompanyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
