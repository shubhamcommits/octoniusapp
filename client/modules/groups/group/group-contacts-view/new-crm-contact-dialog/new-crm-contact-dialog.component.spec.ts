import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCRMContactDialogComponent } from './new-crm-contact-dialog.component';

describe('NewCRMContactDialogComponent', () => {
  let component: NewCRMContactDialogComponent;
  let fixture: ComponentFixture<NewCRMContactDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCRMContactDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCRMContactDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
