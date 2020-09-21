import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleAccountDetailsComponent } from './google-account-details.component';

describe('GoogleAccountDetailsComponent', () => {
  let component: GoogleAccountDetailsComponent;
  let fixture: ComponentFixture<GoogleAccountDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoogleAccountDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
