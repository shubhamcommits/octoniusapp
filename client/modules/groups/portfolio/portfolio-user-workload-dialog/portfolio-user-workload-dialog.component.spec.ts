import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioUserWorkloadDialogComponent } from './portfolio-user-workload-dialog.component';

describe('PortfolioUserWorkloadDialogComponent', () => {
  let component: PortfolioUserWorkloadDialogComponent;
  let fixture: ComponentFixture<PortfolioUserWorkloadDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioUserWorkloadDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioUserWorkloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
