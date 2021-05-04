import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlamingoPreviewComponent } from './flamingo-preview.component';

describe('FlamingoPreviewComponent', () => {
  let component: FlamingoPreviewComponent;
  let fixture: ComponentFixture<FlamingoPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlamingoPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlamingoPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
