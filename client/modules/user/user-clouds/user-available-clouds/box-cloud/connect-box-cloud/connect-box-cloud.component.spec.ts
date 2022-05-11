import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectBoxCloudComponent } from './connect-box-cloud.component';

describe('ConnectBoxCloudComponent', () => {
  let component: ConnectBoxCloudComponent;
  let fixture: ComponentFixture<ConnectBoxCloudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectBoxCloudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectBoxCloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
