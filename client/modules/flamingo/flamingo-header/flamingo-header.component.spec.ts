import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlamingoHeaderComponent } from './flamingo-header.component';

describe('FlamingoHeaderComponent', () => {
  let component: FlamingoHeaderComponent;
  let fixture: ComponentFixture<FlamingoHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlamingoHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlamingoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
