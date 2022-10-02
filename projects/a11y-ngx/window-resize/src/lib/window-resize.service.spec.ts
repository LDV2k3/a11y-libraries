import { TestBed } from '@angular/core/testing';

import { WindowResizeService } from './window-resize.service';

import { WindowResize } from './window-resize.type';

describe('Window Resize Service', () => {
    let service: WindowResizeService;

    const windowSize: WindowResize = { width: window.innerWidth, height: window.innerHeight };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [WindowResizeService]
        });
        service = TestBed.inject(WindowResizeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(`should listen "on resize" with values of ${windowSize.width}px x ${windowSize.height}px`, () => {
        const spyOnResize = spyOn(service.event, 'next');
        window.dispatchEvent(new Event('resize'));
        expect(spyOnResize).toHaveBeenCalledWith(windowSize);
    });
});
