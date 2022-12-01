import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTimeOffDialogComponent } from './user-time-off-dialog.component';

describe('UserTimeOffDialogComponent', () => {
  let component: UserTimeOffDialogComponent;
  let fixture: ComponentFixture<UserTimeOffDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTimeOffDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTimeOffDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
