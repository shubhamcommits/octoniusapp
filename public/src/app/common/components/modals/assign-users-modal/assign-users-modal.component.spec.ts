import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignUsersModalComponent } from './assign-users-modal.component';

describe('AssignUsersModalComponent', () => {
  let component: AssignUsersModalComponent;
  let fixture: ComponentFixture<AssignUsersModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignUsersModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignUsersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
