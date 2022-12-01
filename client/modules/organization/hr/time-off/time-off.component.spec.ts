import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimneOffComponent } from './time-off.component';

describe('TimneOffComponent', () => {
  let component: TimneOffComponent;
  let fixture: ComponentFixture<TimneOffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimneOffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimneOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
