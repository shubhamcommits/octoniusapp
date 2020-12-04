import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectSlackComponent } from './connect-slack.component';

describe('ConnectSlackComponent', () => {
  let component: ConnectSlackComponent;
  let fixture: ComponentFixture<ConnectSlackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectSlackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectSlackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
