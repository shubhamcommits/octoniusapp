import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCustomFieldsColumnDialogComponent } from './show-custom-fields-column-dialog.component';

describe('ShowCustomFieldsColumnDialogComponent', () => {
  let component: ShowCustomFieldsColumnDialogComponent;
  let fixture: ComponentFixture<ShowCustomFieldsColumnDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowCustomFieldsColumnDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowCustomFieldsColumnDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
