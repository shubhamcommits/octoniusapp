import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcesCustomFieldsDialogComponent } from './resources-custom-fields-dialog.component';

describe('ResourcesCustomFieldsDialogComponent', () => {
  let component: ResourcesCustomFieldsDialogComponent;
  let fixture: ComponentFixture<ResourcesCustomFieldsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourcesCustomFieldsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourcesCustomFieldsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
