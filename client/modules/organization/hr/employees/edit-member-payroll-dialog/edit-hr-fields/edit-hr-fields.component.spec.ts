import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHRFieldsComponent } from './edit-hr-fields.component';

describe('EditHRFieldsComponent', () => {
  let component: EditHRFieldsComponent;
  let fixture: ComponentFixture<EditHRFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditHRFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditHRFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
