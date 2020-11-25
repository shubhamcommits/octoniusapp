import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ListUsersPageComponent } from './list-users-page.component';


describe('ListUsersPageComponent', () => {
  let component: ListUsersPageComponent;
  let fixture: ComponentFixture<ListUsersPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListUsersPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListUsersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
