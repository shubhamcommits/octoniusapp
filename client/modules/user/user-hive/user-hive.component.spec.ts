import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserHiveComponent } from './user-hive.component';

describe('UserHiveComponent', () => {
  let component: UserHiveComponent;
  let fixture: ComponentFixture<UserHiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserHiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserHiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
