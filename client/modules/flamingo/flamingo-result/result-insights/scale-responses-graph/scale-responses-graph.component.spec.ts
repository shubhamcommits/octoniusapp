import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScaleResponsesGraphComponent } from './scale-responses-graph.component';

describe('ScaleResponsesGraphComponent', () => {
  let component: ScaleResponsesGraphComponent;
  let fixture: ComponentFixture<ScaleResponsesGraphComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleResponsesGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleResponsesGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
