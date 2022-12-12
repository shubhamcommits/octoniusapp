import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PortfolioNavbarComponent } from './portfolio-navbar.component';

describe('PortfolioNavbarComponent', () => {
  let component: PortfolioNavbarComponent;
  let fixture: ComponentFixture<PortfolioNavbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
