import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCloudsComponent } from './user-clouds.component';

describe('UserCloudsComponent', () => {
  let component: UserCloudsComponent;
  let fixture: ComponentFixture<UserCloudsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserCloudsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCloudsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
