import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConnectedCloudsComponent } from './user-connected-clouds.component';

describe('UserConnectedCloudsComponent', () => {
  let component: UserConnectedCloudsComponent;
  let fixture: ComponentFixture<UserConnectedCloudsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserConnectedCloudsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserConnectedCloudsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
