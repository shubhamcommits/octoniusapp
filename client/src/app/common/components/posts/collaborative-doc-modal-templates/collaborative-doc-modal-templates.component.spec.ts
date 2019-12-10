import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborativeDocModalTemplatesComponent } from './collaborative-doc-modal-templates.component';

describe('CollaborativeDocModalTemplatesComponent', () => {
  let component: CollaborativeDocModalTemplatesComponent;
  let fixture: ComponentFixture<CollaborativeDocModalTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollaborativeDocModalTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollaborativeDocModalTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
