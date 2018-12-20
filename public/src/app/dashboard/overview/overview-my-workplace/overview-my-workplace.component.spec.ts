import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewMyWorkplaceComponent } from './overview-my-workplace.component';

describe('OverviewMyWorkplaceComponent', () => {
  let component: OverviewMyWorkplaceComponent;
  let fixture: ComponentFixture<OverviewMyWorkplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewMyWorkplaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewMyWorkplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
