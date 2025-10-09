import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { forceStylesCleanup } from '../test';

import { A11yOverlayModule } from './overlay.module';
import { OverlayComponent } from './overlay.component';

import { OverlayCreateService } from './overlay-create.service';

import { OVERLAY_CONTAINER_CLASS, OVERLAY_SELECTOR } from './overlay.type.private';

describe('Overlay Create Service', () => {
    let service: OverlayCreateService;

    const className: string = 'testing-overlay-creation';

    beforeAll(() => document.querySelector(`.${OVERLAY_CONTAINER_CLASS}`)?.remove());

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [A11yOverlayModule],
            providers: [OverlayCreateService, ApplicationRef],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        });
        service = TestBed.inject(OverlayCreateService);
    });

    afterEach(() => TestBed.resetTestingModule());

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create an instance of the "OverlayComponent", attach it to the body and then destroy it', fakeAsync(() => {
        const overlayComponent: OverlayComponent = service.createOverlay(new DOMRect(100, 100, 1, 1), 'test', {
            className,
        });
        expect(overlayComponent).toBeTruthy();

        const containerElement: HTMLElement = document.querySelector(`.${OVERLAY_CONTAINER_CLASS}`);
        const overlayElementAttached: HTMLElement = document.querySelector(`.${className}`);

        expect(containerElement.contains(overlayComponent.nativeElement)).toBe(true);
        expect(overlayElementAttached).toBeTruthy();
        expect(overlayElementAttached.nodeName.toLowerCase()).toEqual(OVERLAY_SELECTOR);
        expect(overlayElementAttached).toEqual(overlayComponent.nativeElement);

        const spyOnDestroy = spyOn(overlayComponent, 'destroyOverlay').and.callThrough();
        overlayComponent.destroyOverlay();
        expect(spyOnDestroy).toHaveBeenCalled();

        tick();
        expect(document.querySelector(`.${className}`)).toBe(null);
    }));

    it('should create an instance of the "OverlayComponent" and attach it next to the trigger', () => {
        const trigger: HTMLButtonElement = document.createElement('button');
        document.body.appendChild(trigger);

        const overlayComponent: OverlayComponent = service.createOverlay(trigger, 'test', { className });

        const overlayElementAttached: HTMLElement = document.querySelector(`.${className}`);
        expect(overlayElementAttached).toBeTruthy();
        expect(overlayElementAttached.nodeName.toLowerCase()).toEqual(OVERLAY_SELECTOR);
        expect(overlayElementAttached).toEqual(overlayComponent.nativeElement);

        expect(trigger.nextElementSibling).toEqual(overlayComponent.nativeElement);

        overlayComponent.destroyOverlay();
        trigger.remove();
    });
});
