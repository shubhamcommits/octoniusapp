import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceAddDomainComponent } from './workplace-add-domain.component';

describe('WorkplaceAddDomainComponent', () => {
  let component: WorkplaceAddDomainComponent;
  let fixture: ComponentFixture<WorkplaceAddDomainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkplaceAddDomainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceAddDomainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
