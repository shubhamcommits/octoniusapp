import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMProductInformationComponent } from './crm-product-information.component';

describe('CRMProductInformationComponent', () => {
  let component: CRMProductInformationComponent;
  let fixture: ComponentFixture<CRMProductInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMProductInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMProductInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
