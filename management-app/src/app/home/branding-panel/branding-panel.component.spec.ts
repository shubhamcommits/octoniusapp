import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BrandingPanelComponent } from './branding-panel.component';

describe('BrandingPanelComponent', () => {
  let component: BrandingPanelComponent;
  let fixture: ComponentFixture<BrandingPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BrandingPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandingPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
