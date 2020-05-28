import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupFilesComponent } from './group-files.component';

describe('GroupFilesComponent', () => {
  let component: GroupFilesComponent;
  let fixture: ComponentFixture<GroupFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
