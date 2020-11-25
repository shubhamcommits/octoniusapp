import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectAssigneeComponent } from './select-assignee.component';

describe('SelectAssigneeComponent', () => {
  let component: SelectAssigneeComponent;
  let fixture: ComponentFixture<SelectAssigneeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectAssigneeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectAssigneeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
