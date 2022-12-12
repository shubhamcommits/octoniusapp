import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PortfolioImageDetailsComponent } from './portfolio-image-details.component';

describe('PortfolioImageDetailsComponent', () => {
  let component: PortfolioImageDetailsComponent;
  let fixture: ComponentFixture<PortfolioImageDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioImageDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioImageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
