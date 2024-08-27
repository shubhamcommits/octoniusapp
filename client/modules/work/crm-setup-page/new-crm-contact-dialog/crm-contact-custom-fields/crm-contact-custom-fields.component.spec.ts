import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMContactCustomFieldsComponent } from './crm-contact-custom-fields.component';

describe('CRMContactCustomFieldsComponent', () => {
  let component: CRMContactCustomFieldsComponent;
  let fixture: ComponentFixture<CRMContactCustomFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMContactCustomFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMContactCustomFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
