import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalPerformanceCardComponent } from './global-performance-card.component';

describe('GlobalPerformanceCardComponent', () => {
  let component: GlobalPerformanceCardComponent;
  let fixture: ComponentFixture<GlobalPerformanceCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalPerformanceCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalPerformanceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
