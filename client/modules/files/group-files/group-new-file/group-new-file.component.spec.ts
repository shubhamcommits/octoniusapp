import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupNewFileComponent } from './group-new-file.component';

describe('GroupNewFileComponent', () => {
  let component: GroupNewFileComponent;
  let fixture: ComponentFixture<GroupNewFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupNewFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupNewFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
