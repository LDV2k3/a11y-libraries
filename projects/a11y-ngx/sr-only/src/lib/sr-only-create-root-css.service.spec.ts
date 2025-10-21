import { TestBed } from '@angular/core/testing';

import { SROnlyCreateCSSRootService } from './sr-only-create-root-css.service';

describe('Screen Reader Only Create CSS Root Service', () => {
    let service: SROnlyCreateCSSRootService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SROnlyCreateCSSRootService],
        });

        service = TestBed.inject(SROnlyCreateCSSRootService);
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
            if (styles[i].textContent.includes(':is(a11y-sr-only, a11y-visually-hidden)')) {
                stylesElement = styles[i];
                break;
            }
        }

        expect(stylesElement).toBeTruthy();
        stylesElement?.remove();
    });
});
