import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSearchResultMainComponent } from './user-search-result-main.component';

describe('UserSearchResultMainComponent', () => {
  let component: UserSearchResultMainComponent;
  let fixture: ComponentFixture<UserSearchResultMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSearchResultMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSearchResultMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
