import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMSettingsDialogComponent } from './crm-settings-dialog.component';

describe('CRMSettingsDialogComponent', () => {
  let component: CRMSettingsDialogComponent;
  let fixture: ComponentFixture<CRMSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CRMSettingsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CRMSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
