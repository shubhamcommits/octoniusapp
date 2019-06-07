import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWorkspacePage2Component } from './new-workspace-page-2.component';

describe('NewWorkspacePage2Component', () => {
  let component: NewWorkspacePage2Component;
  let fixture: ComponentFixture<NewWorkspacePage2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewWorkspacePage2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewWorkspacePage2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
