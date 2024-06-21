import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanSectionComponent } from './kanban-section.component';

describe('KanbanSectionComponent', () => {
  let component: KanbanSectionComponent;
  let fixture: ComponentFixture<KanbanSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KanbanSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
