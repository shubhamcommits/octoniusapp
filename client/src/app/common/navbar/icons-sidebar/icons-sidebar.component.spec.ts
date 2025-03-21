import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconsSidebarComponent } from './icons-sidebar.component';

describe('IconsSidebarComponent', () => {
  let component: IconsSidebarComponent;
  let fixture: ComponentFixture<IconsSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconsSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
