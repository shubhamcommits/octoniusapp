import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCommonLayoutComponent } from './auth-common-layout.component';

describe('AuthCommonLayoutComponent', () => {
  let component: AuthCommonLayoutComponent;
  let fixture: ComponentFixture<AuthCommonLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthCommonLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthCommonLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
