import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoungeImageUpdateComponent } from './lounge-image-update.component';

describe('LoungeImageUpdateComponent', () => {
  let component: LoungeImageUpdateComponent;
  let fixture: ComponentFixture<LoungeImageUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoungeImageUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoungeImageUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
