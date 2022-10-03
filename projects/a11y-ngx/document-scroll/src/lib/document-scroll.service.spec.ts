import { TestBed } from '@angular/core/testing';

import { DocumentScrollService } from './document-scroll.service';

describe('Document Scroll Service', () => {
    let service: DocumentScrollService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DocumentScrollService]
        });
        service = TestBed.inject(DocumentScrollService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should listen "on scroll" event from document', () => {
        const spyOnScroll = spyOn(service.event, 'next');
        document.dispatchEvent(new Event('scroll'));
        expect(spyOnScroll).toHaveBeenCalledWith({ x: 0, y: 0 });
    });
});
