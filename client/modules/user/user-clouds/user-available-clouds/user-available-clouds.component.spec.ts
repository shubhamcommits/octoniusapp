import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAvailableCloudsComponent } from './user-available-clouds.component';

describe('UserAvailableCloudsComponent', () => {
  let component: UserAvailableCloudsComponent;
  let fixture: ComponentFixture<UserAvailableCloudsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAvailableCloudsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAvailableCloudsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
