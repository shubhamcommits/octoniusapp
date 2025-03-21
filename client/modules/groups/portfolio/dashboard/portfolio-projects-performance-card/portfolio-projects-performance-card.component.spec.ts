import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PortfolioProjectsPerformanceCardComponent } from './portfolio-projects-performance-card.component';

describe('PortfolioProjectsPerformanceCardComponent', () => {
  let component: PortfolioProjectsPerformanceCardComponent;
  let fixture: ComponentFixture<PortfolioProjectsPerformanceCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioProjectsPerformanceCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioProjectsPerformanceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
