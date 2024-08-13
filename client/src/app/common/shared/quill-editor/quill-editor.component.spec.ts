import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OctoQuillEditorComponent } from './quill-editor.component';

describe('OctoQuillEditorComponent', () => {
  let component: OctoQuillEditorComponent;
  let fixture: ComponentFixture<OctoQuillEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OctoQuillEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OctoQuillEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
