import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageActionsBarComponent } from './page-actions-bar.component';

describe('PageActionsBarComponent', () => {
  let component: PageActionsBarComponent;
  let fixture: ComponentFixture<PageActionsBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageActionsBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageActionsBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
