import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTaskDialogComponent } from './search-task-dialog.component';

describe('SearchTaskDialogComponent', () => {
  let component: SearchTaskDialogComponent;
  let fixture: ComponentFixture<SearchTaskDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchTaskDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchTaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
