import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultInsightsComponent } from './result-insights.component';

describe('ResultInsightsComponent', () => {
  let component: ResultInsightsComponent;
  let fixture: ComponentFixture<ResultInsightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultInsightsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultInsightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
