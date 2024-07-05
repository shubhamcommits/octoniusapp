import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CRMOrderDialogComponent } from './crm-order-dialog.component';

describe('CRMOrderDialogComponent', () => {
  let component: CRMOrderDialogComponent;
  let fixture: ComponentFixture<CRMOrderDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMOrderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
