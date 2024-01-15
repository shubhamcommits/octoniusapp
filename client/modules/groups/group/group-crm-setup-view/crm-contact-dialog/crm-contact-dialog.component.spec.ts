import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMContactDialogComponent } from './crm-contact-dialog.component';

describe('CRMContactDialogComponent', () => {
  let component: CRMContactDialogComponent;
  let fixture: ComponentFixture<CRMContactDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMContactDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMContactDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
