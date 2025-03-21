import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SubtasksComponent } from './subtasks.component';

describe('SubtasksComponent', () => {
  let component: SubtasksComponent;
  let fixture: ComponentFixture<SubtasksComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SubtasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubtasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
