import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartPersonComponent } from './chart-person.component';

describe('ChartPersonComponent', () => {
  let component: ChartPersonComponent;
  let fixture: ComponentFixture<ChartPersonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartPersonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
