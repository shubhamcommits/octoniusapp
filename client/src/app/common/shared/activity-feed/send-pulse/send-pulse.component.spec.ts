import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SendPulseComponent } from './send-pulse.component';

describe('SendPulseComponent', () => {
  let component: SendPulseComponent;
  let fixture: ComponentFixture<SendPulseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SendPulseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendPulseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
