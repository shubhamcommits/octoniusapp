import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GlobalNorthStarStatsComponent } from './global-north-star-stats.component';

describe('NorthStarComponent', () => {
  let component: GlobalNorthStarStatsComponent;
  let fixture: ComponentFixture<GlobalNorthStarStatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalNorthStarStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalNorthStarStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
