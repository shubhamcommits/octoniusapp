import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZapAuthConfirmationComponent } from './zap-auth-confirmation.component';

describe('ZapAuthConfirmationComponent', () => {
  let component: ZapAuthConfirmationComponent;
  let fixture: ComponentFixture<ZapAuthConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZapAuthConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZapAuthConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
