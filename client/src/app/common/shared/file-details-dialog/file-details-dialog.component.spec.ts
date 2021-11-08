import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FileDetailsDialogComponent } from './file-details-dialog.component';

describe('FileDetailsDialogComponent', () => {
  let component: FileDetailsDialogComponent;
  let fixture: ComponentFixture<FileDetailsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FileDetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
