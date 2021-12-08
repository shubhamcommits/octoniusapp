import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoungeNewElementComponent } from './lounge-new-element.component';

describe('LoungeNewElementComponent', () => {
  let component: LoungeNewElementComponent;
  let fixture: ComponentFixture<LoungeNewElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoungeNewElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoungeNewElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
