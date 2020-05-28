import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolioEditorComponent } from './folio-editor.component';

describe('FolioEditorComponent', () => {
  let component: FolioEditorComponent;
  let fixture: ComponentFixture<FolioEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolioEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolioEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
