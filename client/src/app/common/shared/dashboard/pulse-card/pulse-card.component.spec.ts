import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PulseCardComponent } from './pulse-card.component';

describe('PulseCardComponent', () => {
  let component: PulseCardComponent;
  let fixture: ComponentFixture<PulseCardComponent>;

  beforeEach(async(() => {
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
