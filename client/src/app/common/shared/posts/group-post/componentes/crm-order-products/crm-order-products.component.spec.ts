import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCRMOrderProductsComponent } from './crm-order-products.component';

describe('PostCRMOrderProductsComponent', () => {
  let component: PostCRMOrderProductsComponent;
  let fixture: ComponentFixture<PostCRMOrderProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostCRMOrderProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostCRMOrderProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
