import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectGoogleCloudComponent } from './connect-google-cloud.component';

describe('ConnectGoogleCloudComponent', () => {
  let component: ConnectGoogleCloudComponent;
  let fixture: ComponentFixture<ConnectGoogleCloudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectGoogleCloudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectGoogleCloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
