import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMyGroupSettingsComponent } from './user-my-group-settings.component';

describe('UserMyGroupSettingsComponent', () => {
  let component: UserMyGroupSettingsComponent;
  let fixture: ComponentFixture<UserMyGroupSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserMyGroupSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMyGroupSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
