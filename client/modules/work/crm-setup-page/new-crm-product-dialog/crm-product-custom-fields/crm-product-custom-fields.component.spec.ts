import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMProductCustomFieldsComponent } from './crm-product-custom-fields.component';

describe('CRMProductCustomFieldsComponent', () => {
  let component: CRMProductCustomFieldsComponent;
  let fixture: ComponentFixture<CRMProductCustomFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMProductCustomFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMProductCustomFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
