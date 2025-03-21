import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityAddMembersDialogComponent } from './entity-add-members-dialog.component';

describe('EntityAddMembersDialogComponent', () => {
  let component: EntityAddMembersDialogComponent;
  let fixture: ComponentFixture<EntityAddMembersDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityAddMembersDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityAddMembersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
