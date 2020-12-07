import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserImageDetailsComponent } from './user-image-details.component';

describe('UserImageDetailsComponent', () => {
  let component: UserImageDetailsComponent;
  let fixture: ComponentFixture<UserImageDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserImageDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserImageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
