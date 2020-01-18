import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWorkspacePage1Component } from './new-workspace-page-1.component';

describe('NewWorkspacePage1Component', () => {
  let component: NewWorkspacePage1Component;
  let fixture: ComponentFixture<NewWorkspacePage1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewWorkspacePage1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewWorkspacePage1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
