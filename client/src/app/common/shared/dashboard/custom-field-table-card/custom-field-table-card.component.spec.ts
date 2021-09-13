import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomFieldTableCardComponent } from './custom-field-table-card.component';

describe('CustomFieldTableCardComponent', () => {
  let component: CustomFieldTableCardComponent;
  let fixture: ComponentFixture<CustomFieldTableCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomFieldTableCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomFieldTableCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
