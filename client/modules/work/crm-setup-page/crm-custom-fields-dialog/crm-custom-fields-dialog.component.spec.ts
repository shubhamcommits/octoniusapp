import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMCustomFieldsDialogComponent } from './crm-custom-fields-dialog.component';

describe('CRMCustomFieldsDialogComponent', () => {
  let component: CRMCustomFieldsDialogComponent;
  let fixture: ComponentFixture<CRMCustomFieldsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMCustomFieldsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMCustomFieldsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
