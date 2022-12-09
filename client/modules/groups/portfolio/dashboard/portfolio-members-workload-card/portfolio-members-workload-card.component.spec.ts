import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioMembersWorkloadCardComponent } from './portfolio-members-workload-card.component';

describe('PortfolioMembersWorkloadCardComponent', () => {
  let component: PortfolioMembersWorkloadCardComponent;
  let fixture: ComponentFixture<PortfolioMembersWorkloadCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortfolioMembersWorkloadCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioMembersWorkloadCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
