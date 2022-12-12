import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioGroupsListComponent } from './portfolio-groups-list.component';

describe('PortfolioGroupsListComponent', () => {
  let component: PortfolioGroupsListComponent;
  let fixture: ComponentFixture<PortfolioGroupsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioGroupsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioGroupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
