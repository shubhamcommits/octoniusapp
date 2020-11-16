import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleAssignmentsComponent } from './multiple-assignments.component';

describe('MultipleAssignmentsComponent', () => {
  let component: MultipleAssignmentsComponent;
  let fixture: ComponentFixture<MultipleAssignmentsComponent>;

  beforeEach(async(() => {
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
