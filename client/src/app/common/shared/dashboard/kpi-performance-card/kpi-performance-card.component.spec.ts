import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KpiPerformanceCardComponent } from './kpi-performance-card.component';

describe('KpiPerformanceCardComponent', () => {
  let component: KpiPerformanceCardComponent;
  let fixture: ComponentFixture<KpiPerformanceCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiPerformanceCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiPerformanceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
