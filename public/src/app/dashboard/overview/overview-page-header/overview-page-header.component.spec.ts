import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewPageHeaderComponent } from './overview-page-header.component';

describe('OverviewPageHeaderComponent', () => {
  let component: OverviewPageHeaderComponent;
  let fixture: ComponentFixture<OverviewPageHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverviewPageHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewPageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
