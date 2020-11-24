import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ComponentSearchBarComponent } from './component-search-bar.component';

describe('ComponentSearchBarComponent', () => {
  let component: ComponentSearchBarComponent;
  let fixture: ComponentFixture<ComponentSearchBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ComponentSearchBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
