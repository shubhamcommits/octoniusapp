import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeOffCardComponent } from './time-off-card.component';

describe('TimeOffCardComponent', () => {
  let component: TimeOffCardComponent;
  let fixture: ComponentFixture<TimeOffCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeOffCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeOffCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
