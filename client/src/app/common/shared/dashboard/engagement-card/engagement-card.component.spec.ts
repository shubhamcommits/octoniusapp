import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EngagementCardComponent } from './engagement-card.component';

describe('EngagementCardComponent', () => {
  let component: EngagementCardComponent;
  let fixture: ComponentFixture<EngagementCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EngagementCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EngagementCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
