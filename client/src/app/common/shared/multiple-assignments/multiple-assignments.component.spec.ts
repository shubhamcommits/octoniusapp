import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MultipleAssignmentsComponent } from './multiple-assignments.component';

describe('MultipleAssignmentsComponent', () => {
  let component: MultipleAssignmentsComponent;
  let fixture: ComponentFixture<MultipleAssignmentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleAssignmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleAssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
