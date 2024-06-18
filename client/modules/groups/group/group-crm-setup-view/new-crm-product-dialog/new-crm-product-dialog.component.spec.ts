import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCRMCompanyDialogComponent } from './new-crm-product-dialog.component';

describe('NewCRMCompanyDialogComponent', () => {
  let component: NewCRMCompanyDialogComponent;
  let fixture: ComponentFixture<NewCRMCompanyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCRMCompanyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCRMCompanyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
