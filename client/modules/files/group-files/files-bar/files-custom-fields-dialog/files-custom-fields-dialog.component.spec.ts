import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesCustomFieldsDialogComponent } from './files-custom-fields-dialog.component';

describe('FilesCustomFieldsDialogComponent', () => {
  let component: FilesCustomFieldsDialogComponent;
  let fixture: ComponentFixture<FilesCustomFieldsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesCustomFieldsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesCustomFieldsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
