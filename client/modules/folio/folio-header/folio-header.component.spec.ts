import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolioHeaderComponent } from './folio-header.component';

describe('FolioHeaderComponent', () => {
  let component: FolioHeaderComponent;
  let fixture: ComponentFixture<FolioHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolioHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolioHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
