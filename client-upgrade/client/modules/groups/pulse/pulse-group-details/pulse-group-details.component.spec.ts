import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PulseGroupDetailsComponent } from './pulse-group-details.component';

describe('PulseGroupDetailsComponent', () => {
  let component: PulseGroupDetailsComponent;
  let fixture: ComponentFixture<PulseGroupDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PulseGroupDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PulseGroupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
