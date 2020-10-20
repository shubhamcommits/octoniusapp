import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleDirectoryCardComponent } from './people-directory-card.component';

describe('PeopleDirectoryCardComponent', () => {
  let component: PeopleDirectoryCardComponent;
  let fixture: ComponentFixture<PeopleDirectoryCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeopleDirectoryCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeopleDirectoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
