import { TestBed } from '@angular/core/testing';
import { forceStylesCleanup } from '../test';

import { OverlayCreateCSSRootService } from './overlay-create-root-css.service';

describe('Overlay Create CSS Root Service', () => {
    let service: OverlayCreateCSSRootService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [OverlayCreateCSSRootService],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        });

        service = TestBed.inject(OverlayCreateCSSRootService);
    });

    afterEach(() => TestBed.resetTestingModule());

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create the <style> tag with the root css for overlays', () => {
        service.createCSSRoot();

        const styles: HTMLStyleElement[] = Array.from(document.querySelectorAll('style'));
        let stylesElement!: HTMLStyleElement;

        for (let i = 0; i < styles.length; i++) {
            if (styles[i].textContent.includes('[a11y-overlay-base]')) {
                stylesElement = styles[i];
                break;
            }
        }

        expect(stylesElement).toBeTruthy();
        stylesElement?.remove();
    });
});
