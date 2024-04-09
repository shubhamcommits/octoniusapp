import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MS365AccountDetailsComponent } from './ms-365-account-details.component';

describe('MS365AccountDetailsComponent', () => {
  let component: MS365AccountDetailsComponent;
  let fixture: ComponentFixture<MS365AccountDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MS365AccountDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MS365AccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
