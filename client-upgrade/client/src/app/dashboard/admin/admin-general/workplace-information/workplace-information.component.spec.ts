import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceInformationComponent } from './workplace-information.component';

describe('WorkplaceInformationComponent', () => {
  let component: WorkplaceInformationComponent;
  let fixture: ComponentFixture<WorkplaceInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplaceInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
