import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KanbanArchivedSectionsComponent } from './kanban-archived-sections.component';

describe('KanbanArchivedSectionsComponent', () => {
  let component: KanbanArchivedSectionsComponent;
  let fixture: ComponentFixture<KanbanArchivedSectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KanbanArchivedSectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KanbanArchivedSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
