import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectMS365CloudComponent } from './connect-ms-365-cloud.component';

describe('ConnectMS365CloudComponent', () => {
  let component: ConnectMS365CloudComponent;
  let fixture: ComponentFixture<ConnectMS365CloudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectMS365CloudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectMS365CloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
