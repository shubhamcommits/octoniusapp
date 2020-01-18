import { TestBed, inject } from '@angular/core/testing';

import { QuillAutoLinkService } from './quill-auto-link.service';

describe('QuillAutoLinkService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuillAutoLinkService]
    });
  });

  it('should be created', inject([QuillAutoLinkService], (service: QuillAutoLinkService) => {
    expect(service).toBeTruthy();
  }));
});
