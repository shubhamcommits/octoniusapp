import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleDirectoryComponent } from './people-directory.component';

describe('PeopleDirectoryComponent', () => {
  let component: PeopleDirectoryComponent;
  let fixture: ComponentFixture<PeopleDirectoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeopleDirectoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeopleDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
