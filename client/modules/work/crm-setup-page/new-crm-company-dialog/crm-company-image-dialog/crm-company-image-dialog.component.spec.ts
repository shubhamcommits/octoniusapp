import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CRMCompanyImageDialogComponent } from './crm-company-image-dialog.component';

describe('CRMCompanyImageDialogComponent', () => {
  let component: CRMCompanyImageDialogComponent;
  let fixture: ComponentFixture<CRMCompanyImageDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMCompanyImageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCompanyImageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
