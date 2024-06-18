import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCRMOrderProductDialogComponent } from './new-crm-order-product-dialog.component';

describe('NewCRMOrderProductDialogComponent', () => {
  let component: NewCRMOrderProductDialogComponent;
  let fixture: ComponentFixture<NewCRMOrderProductDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCRMOrderProductDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCRMOrderProductDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
