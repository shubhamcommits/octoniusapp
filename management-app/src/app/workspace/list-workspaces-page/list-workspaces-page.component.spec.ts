import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ListWorkspacesPageComponent } from './list-workspaces-page.component';


describe('ListWorkspacesPageComponent', () => {
  let component: ListWorkspacesPageComponent;
  let fixture: ComponentFixture<ListWorkspacesPageComponent>;

  beforeEach(async(() => {
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
