import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewMyTasksComponent } from './overview-my-tasks.component';

describe('OverviewMyTasksComponent', () => {
  let component: OverviewMyTasksComponent;
  let fixture: ComponentFixture<OverviewMyTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewMyTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewMyTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
