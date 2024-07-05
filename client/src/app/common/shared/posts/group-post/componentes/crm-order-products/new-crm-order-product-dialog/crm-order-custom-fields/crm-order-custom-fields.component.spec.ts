import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMOrderCustomFieldsComponent } from './crm-order-custom-fields.component';

describe('CRMOrderCustomFieldsComponent', () => {
  let component: CRMOrderCustomFieldsComponent;
  let fixture: ComponentFixture<CRMOrderCustomFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMOrderCustomFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMOrderCustomFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
