import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkNavbarComponent } from './work-navbar.component';

describe('WorkNavbarComponent', () => {
  let component: WorkNavbarComponent;
  let fixture: ComponentFixture<WorkNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
