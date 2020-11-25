import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkStatisticsCardComponent } from './work-statistics-card.component';

describe('WorkStatisticsCardComponent', () => {
  let component: WorkStatisticsCardComponent;
  let fixture: ComponentFixture<WorkStatisticsCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkStatisticsCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkStatisticsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
