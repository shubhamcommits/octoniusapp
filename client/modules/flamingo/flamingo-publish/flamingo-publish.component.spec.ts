import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlamingoPublishComponent } from './flamingo-publish.component';

describe('FlamingoPublishComponent', () => {
  let component: FlamingoPublishComponent;
  let fixture: ComponentFixture<FlamingoPublishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlamingoPublishComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlamingoPublishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
