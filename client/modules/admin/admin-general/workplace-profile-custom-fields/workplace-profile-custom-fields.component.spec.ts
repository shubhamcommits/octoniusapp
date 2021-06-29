import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkplaceProfileCustomFieldsComponent } from './workplace-profile-custom-fields.component';

describe('WorkplaceProfileCustomFieldsComponent', () => {
  let component: WorkplaceProfileCustomFieldsComponent;
  let fixture: ComponentFixture<WorkplaceProfileCustomFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplaceProfileCustomFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceProfileCustomFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
