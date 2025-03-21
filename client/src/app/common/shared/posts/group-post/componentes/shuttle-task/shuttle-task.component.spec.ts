import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShuttleTaskComponent } from './shuttle-task.component';

describe('ShuttleTaskComponent', () => {
  let component: ShuttleTaskComponent;
  let fixture: ComponentFixture<ShuttleTaskComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShuttleTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShuttleTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
