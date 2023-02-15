import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfluenceImportDialogComponent } from './confluence-import-dialog.component';

describe('ConfluenceImportDialogComponent', () => {
  let component: ConfluenceImportDialogComponent;
  let fixture: ComponentFixture<ConfluenceImportDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfluenceImportDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfluenceImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
