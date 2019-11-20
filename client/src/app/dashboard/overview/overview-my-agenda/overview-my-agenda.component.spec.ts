import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {OverviewMyAgendaComponent} from './overview-my-agenda.component';

describe('OverviewMyAgendaComponent', () => {
  let component: OverviewMyAgendaComponent;
  let fixture: ComponentFixture<OverviewMyAgendaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OverviewMyAgendaComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewMyAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
