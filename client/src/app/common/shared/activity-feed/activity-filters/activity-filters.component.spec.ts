import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActivityFiltersComponent } from './activity-filters.component';

describe('ActivityFiltersComponent', () => {
  let component: ActivityFiltersComponent;
  let fixture: ComponentFixture<ActivityFiltersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
