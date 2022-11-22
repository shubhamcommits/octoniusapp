import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingTasksCardComponent } from './pending-tasks-card.component';

describe('PendingTasksCardComponent', () => {
  let component: PendingTasksCardComponent;
  let fixture: ComponentFixture<PendingTasksCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingTasksCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingTasksCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
