import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EngagementCardComponent } from './engagement-card.component';

describe('EngagementCardComponent', () => {
  let component: EngagementCardComponent;
  let fixture: ComponentFixture<EngagementCardComponent>;

  beforeEach(async(() => {
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
