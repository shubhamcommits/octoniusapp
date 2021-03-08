import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MobileNavbarComponent } from './mobile-navbar.component';

describe('MobileNavbarComponent', () => {
  let component: MobileNavbarComponent;
  let fixture: ComponentFixture<MobileNavbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
