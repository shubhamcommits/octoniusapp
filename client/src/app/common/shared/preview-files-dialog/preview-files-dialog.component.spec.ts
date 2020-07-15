import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewFilesDialogComponent } from './preview-files-dialog.component';

describe('PreviewFilesDialogComponent', () => {
  let component: PreviewFilesDialogComponent;
  let fixture: ComponentFixture<PreviewFilesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewFilesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewFilesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
