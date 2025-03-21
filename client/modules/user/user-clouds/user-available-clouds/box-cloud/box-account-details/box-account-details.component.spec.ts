import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoxAccountDetailsComponent } from './box-account-details.component';

describe('BoxAccountDetailsComponent', () => {
  let component: BoxAccountDetailsComponent;
  let fixture: ComponentFixture<BoxAccountDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoxAccountDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoxAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
