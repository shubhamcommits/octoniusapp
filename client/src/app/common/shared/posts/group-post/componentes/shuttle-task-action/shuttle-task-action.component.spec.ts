import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShuttleTaskActionComponent } from './shuttle-task-action.component';

describe('ShuttleTaskActionComponent', () => {
  let component: ShuttleTaskActionComponent;
  let fixture: ComponentFixture<ShuttleTaskActionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShuttleTaskActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShuttleTaskActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
