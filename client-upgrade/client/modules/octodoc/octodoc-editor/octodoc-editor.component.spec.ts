import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OctodocEditorComponent } from './octodoc-editor.component';

describe('OctodocEditorComponent', () => {
  let component: OctodocEditorComponent;
  let fixture: ComponentFixture<OctodocEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OctodocEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OctodocEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
