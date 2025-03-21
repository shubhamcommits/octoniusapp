import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PortfolioWorkStatisticsCardComponent } from './portfolio-work-statistics-card.component';

describe('PortfolioWorkStatisticsCardComponent', () => {
  let component: PortfolioWorkStatisticsCardComponent;
  let fixture: ComponentFixture<PortfolioWorkStatisticsCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioWorkStatisticsCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioWorkStatisticsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
