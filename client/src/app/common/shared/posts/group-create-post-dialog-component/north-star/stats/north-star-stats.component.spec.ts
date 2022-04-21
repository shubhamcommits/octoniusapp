import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NorthStarStatsComponent } from './north-star-stats.component';

describe('NorthStarComponent', () => {
  let component: NorthStarStatsComponent;
  let fixture: ComponentFixture<NorthStarStatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NorthStarStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NorthStarStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
