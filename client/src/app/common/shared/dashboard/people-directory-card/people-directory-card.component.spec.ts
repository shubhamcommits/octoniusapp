import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeopleDirectoryCardComponent } from './people-directory-card.component';

describe('PeopleDirectoryCardComponent', () => {
  let component: PeopleDirectoryCardComponent;
  let fixture: ComponentFixture<PeopleDirectoryCardComponent>;

  beforeEach(waitForAsync(() => {
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
