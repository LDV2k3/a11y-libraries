import { TestBed } from '@angular/core/testing';
import { forceStylesCleanup } from '../test';

import { A11yOverlayModule } from './overlay.module';
import { OverlayContainerService } from './overlay-container.service';

import { OVERLAY_CONTAINER_CLASS } from './overlay.type.private';

describe('Overlay Container Service', () => {
    let service: OverlayContainerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [A11yOverlayModule],
            providers: [OverlayContainerService],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        });

        service = TestBed.inject(OverlayContainerService);
        document.querySelector(`.${OVERLAY_CONTAINER_CLASS}`)?.remove();
    });

    afterEach(() => {
        service.ngOnDestroy();
        TestBed.resetTestingModule();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should not have the container within the body the first time', () => {
        const divContainer: HTMLDivElement[] = Array.from(document.querySelectorAll(`.${OVERLAY_CONTAINER_CLASS}`));
        expect(divContainer.length).toBe(0);
    });

    it('should have the container within the body and return it', () => {
        const overlayContainer: HTMLDivElement = service.overlayContainer;
        const overlayContainer2: HTMLDivElement = service.overlayContainer;
        const divContainer: HTMLDivElement[] = Array.from(document.querySelectorAll(`.${OVERLAY_CONTAINER_CLASS}`));

        expect(divContainer).not.toBe(null);
        expect(divContainer.length).toBe(1);
        expect(divContainer[0]).toEqual(overlayContainer);
        expect(divContainer[0]).toEqual(overlayContainer2);
    });
});
