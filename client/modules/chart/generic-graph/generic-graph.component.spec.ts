import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericGraphComponent } from './generic-graph.component';

describe('GenericGraphComponent', () => {
  let component: GenericGraphComponent;
  let fixture: ComponentFixture<GenericGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
