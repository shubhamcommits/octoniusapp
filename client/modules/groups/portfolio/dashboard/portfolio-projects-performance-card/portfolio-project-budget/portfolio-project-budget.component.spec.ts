import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PortfolioProjectBudgetComponent } from './portfolio-project-budget.component';

describe('PortfolioProjectBudgetComponent', () => {
  let component: PortfolioProjectBudgetComponent;
  let fixture: ComponentFixture<PortfolioProjectBudgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioProjectBudgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioProjectBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
