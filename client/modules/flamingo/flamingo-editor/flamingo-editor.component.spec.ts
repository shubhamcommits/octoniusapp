import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlamingoEditorComponent } from './flamingo-editor.component';

describe('FlamingoEditorComponent', () => {
  let component: FlamingoEditorComponent;
  let fixture: ComponentFixture<FlamingoEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlamingoEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlamingoEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
