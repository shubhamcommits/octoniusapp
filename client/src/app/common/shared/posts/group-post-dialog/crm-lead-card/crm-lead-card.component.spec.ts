import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CRMLeadCardComponent } from './crm-lead-card.component';

describe('CRMLeadCardComponent', () => {
  let component: CRMLeadCardComponent;
  let fixture: ComponentFixture<CRMLeadCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CRMLeadCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMLeadCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
