import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFieldsDialogComponent } from './custom-fields-dialog.component';

describe('CustomFieldsDialogComponent', () => {
  let component: CustomFieldsDialogComponent;
  let fixture: ComponentFixture<CustomFieldsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomFieldsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomFieldsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
