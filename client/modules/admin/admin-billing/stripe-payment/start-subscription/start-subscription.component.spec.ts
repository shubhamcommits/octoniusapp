import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartSubscriptionComponent } from './start-subscription.component';

describe('StartSubscriptionComponent', () => {
  let component: StartSubscriptionComponent;
  let fixture: ComponentFixture<StartSubscriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartSubscriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
