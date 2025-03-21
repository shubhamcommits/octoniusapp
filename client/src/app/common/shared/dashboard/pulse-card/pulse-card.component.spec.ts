import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PulseCardComponent } from './pulse-card.component';

describe('PulseCardComponent', () => {
  let component: PulseCardComponent;
  let fixture: ComponentFixture<PulseCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PulseCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PulseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
