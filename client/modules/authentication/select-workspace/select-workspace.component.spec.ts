import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectWorkspaceComponent } from './select-workspace.component';

describe('SelectWorkspaceComponent', () => {
  let component: SelectWorkspaceComponent;
  let fixture: ComponentFixture<SelectWorkspaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectWorkspaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
