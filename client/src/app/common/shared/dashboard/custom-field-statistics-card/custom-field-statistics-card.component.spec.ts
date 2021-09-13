import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomFieldStatisticsCardComponent } from './custom-field-statistics-card.component';

describe('CustomFieldStatisticsCardComponent', () => {
  let component: CustomFieldStatisticsCardComponent;
  let fixture: ComponentFixture<CustomFieldStatisticsCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomFieldStatisticsCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomFieldStatisticsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
