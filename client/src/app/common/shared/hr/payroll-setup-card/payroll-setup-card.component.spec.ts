import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollSetupCardComponent } from './payroll-setup-card.component';

describe('PayrollSetupCardComponent', () => {
  let component: PayrollSetupCardComponent;
  let fixture: ComponentFixture<PayrollSetupCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayrollSetupCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayrollSetupCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
