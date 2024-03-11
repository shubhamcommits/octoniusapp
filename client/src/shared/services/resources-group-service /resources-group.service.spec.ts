import { TestBed } from '@angular/core/testing';

import { ResourcesGroupService } from './resources-group.service';

describe('ResourcesGroupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResourcesGroupService = TestBed.get(ResourcesGroupService);
    expect(service).toBeTruthy();
  });
});
