import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAssigneeComponent } from './select-assignee.component';

describe('SelectAssigneeComponent', () => {
  let component: SelectAssigneeComponent;
  let fixture: ComponentFixture<SelectAssigneeComponent>;

  beforeEach(async(() => {
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
