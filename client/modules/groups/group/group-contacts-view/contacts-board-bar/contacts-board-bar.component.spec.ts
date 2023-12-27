import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsBoardBarComponent } from './contacts-board-bar.component';

describe('ContactsContactsBoardBarComponent', () => {
  let component: ContactsBoardBarComponent;
  let fixture: ComponentFixture<ContactsBoardBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactsBoardBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactsBoardBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
