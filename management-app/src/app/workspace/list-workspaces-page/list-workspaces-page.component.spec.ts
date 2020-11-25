import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ListWorkspacesPageComponent } from './list-workspaces-page.component';


describe('ListWorkspacesPageComponent', () => {
  let component: ListWorkspacesPageComponent;
  let fixture: ComponentFixture<ListWorkspacesPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListWorkspacesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListWorkspacesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
