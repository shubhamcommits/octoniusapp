import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddColumnPropertyDialogComponent } from './add-column-property-dialog.component';

describe('AddColumnPropertyDialogComponent', () => {
  let component: AddColumnPropertyDialogComponent;
  let fixture: ComponentFixture<AddColumnPropertyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddColumnPropertyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddColumnPropertyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
