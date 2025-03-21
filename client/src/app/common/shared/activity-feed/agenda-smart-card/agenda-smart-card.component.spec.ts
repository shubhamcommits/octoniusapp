import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AgendaSmartCardComponent } from './agenda-smart-card.component';

describe('AgendaSmartCardComponent', () => {
  let component: AgendaSmartCardComponent;
  let fixture: ComponentFixture<AgendaSmartCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AgendaSmartCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendaSmartCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
