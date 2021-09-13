import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomFieldsTableSettingsDialogComponent } from './custom-fields-table-settings-dialog.component';


describe('CustomFieldsTableSettingsDialogComponent', () => {
  let component: CustomFieldsTableSettingsDialogComponent;
  let fixture: ComponentFixture<CustomFieldsTableSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomFieldsTableSettingsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomFieldsTableSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
