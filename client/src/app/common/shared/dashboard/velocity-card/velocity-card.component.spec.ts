import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VelocityCardComponent } from './velocity-card.component';

describe('VelocityCardComponent', () => {
  let component: VelocityCardComponent;
  let fixture: ComponentFixture<VelocityCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VelocityCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VelocityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
