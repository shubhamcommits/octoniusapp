import { TestBed, async } from '@angular/core/testing';
import { OfficeEditorComponent } from './office-editor.component';

describe('OfficeEditorComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        OfficeEditorComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(OfficeEditorComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'word-poc'`, () => {
    const fixture = TestBed.createComponent(OfficeEditorComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('word-poc');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(OfficeEditorComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to word-poc!');
  });
});
