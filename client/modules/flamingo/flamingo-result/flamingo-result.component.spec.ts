import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlamingoResultComponent } from './flamingo-result.component';

describe('FlamingoResultComponent', () => {
  let component: FlamingoResultComponent;
  let fixture: ComponentFixture<FlamingoResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlamingoResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlamingoResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
