import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { ApplicationRef, Component, ComponentRef } from '@angular/core';
import { forceStylesCleanup } from '../test';

import { A11yOverlayModule } from './overlay.module';

import { OverlayBaseComponent } from './overlay.component.base';
import { OverlayCreateBaseService } from './overlay-create.service.base';

import { OVERLAY_CONTAINER_CLASS } from './overlay.type.private';

import { ERROR_DESTROY_METHOD_UNEXISTING } from './overlay.errors';

const CUSTOM_TESTING_COMPONENT_SELECTOR: string = 'testing-overlay-component';

@Component({
    selector: CUSTOM_TESTING_COMPONENT_SELECTOR,
    template: '',
})
export class CustomOverlayTestComponent extends OverlayBaseComponent {
    customDestroyMethod = (): void => {
        return;
    };
}

describe('Overlay Create Base Service', () => {
    let fixture: ComponentFixture<CustomOverlayTestComponent>;
    let service: OverlayCreateBaseService;

    const className: string = 'testing-overlay-creation';

    beforeAll(() => document.querySelector(`.${OVERLAY_CONTAINER_CLASS}`)?.remove());

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CustomOverlayTestComponent],
            imports: [A11yOverlayModule],
            providers: [OverlayCreateBaseService, ApplicationRef],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        });

        fixture = TestBed.createComponent(CustomOverlayTestComponent);
        fixture.detectChanges();
        service = TestBed.inject(OverlayCreateBaseService);
    }));

    afterEach(() => {
        fixture.nativeElement.remove();
        fixture.destroy();
        TestBed.resetTestingModule();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create an instance of the "CustomOverlayTestComponent", attach it to the body and then destroy it', fakeAsync(() => {
        const overlayRef: ComponentRef<CustomOverlayTestComponent> =
            service.createComponent(CustomOverlayTestComponent);
        expect(overlayRef).toBeTruthy();

        service.configComponentInstance(overlayRef, new DOMRect(100, 100, 1, 1), { className }, 'customDestroyMethod');

        const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
        const appRefViewInit: number = appRef.viewCount;
        const overlayElement: HTMLElement = service.attachViewAndGetComponentElement(overlayRef);
        expect(appRef.viewCount).toBe(appRefViewInit + 1);

        service.attachToBody(overlayElement);

        const containerElement: HTMLElement = document.querySelector(`.${OVERLAY_CONTAINER_CLASS}`);
        const overlayElementAttached: HTMLElement = document.querySelector(`.${className}`);
        expect(containerElement.contains(overlayElement)).toBe(true);
        expect(overlayElementAttached).toBeTruthy();
        expect(overlayElementAttached.nodeName.toLowerCase()).toEqual(CUSTOM_TESTING_COMPONENT_SELECTOR);
        expect(overlayElementAttached).toEqual(overlayElement);

        const spyOnDestroy = spyOn(overlayRef.instance, 'customDestroyMethod').and.callThrough();
        overlayRef.instance.customDestroyMethod();
        expect(spyOnDestroy).toHaveBeenCalled();

        tick();
        expect(document.querySelector(`.${className}`)).toBe(null);
    }));

    it('should create an instance of the "CustomOverlayTestComponent" and attach it next to the trigger', () => {
        const overlayRef: ComponentRef<CustomOverlayTestComponent> =
            service.createComponent(CustomOverlayTestComponent);

        const trigger: HTMLButtonElement = document.createElement('button');
        document.body.appendChild(trigger);

        service.configComponentInstance(overlayRef, trigger, { className }, 'customDestroyMethod');

        const overlayElement: HTMLElement = service.attachViewAndGetComponentElement(overlayRef);
        service.attachAfterTrigger(trigger, overlayElement);

        const overlayElementAttached: HTMLElement = document.querySelector(`.${className}`);
        expect(overlayElementAttached).toBeTruthy();
        expect(overlayElementAttached.nodeName.toLowerCase()).toEqual(CUSTOM_TESTING_COMPONENT_SELECTOR);
        expect(overlayElementAttached).toEqual(overlayElement);

        expect(trigger.nextElementSibling).toEqual(overlayElement);

        overlayRef.instance.customDestroyMethod();
        trigger.remove();
    });

    it('should throw a warning when non existing method for "destroy" is passed', () => {
        const overlayRef: ComponentRef<CustomOverlayTestComponent> =
            service.createComponent(CustomOverlayTestComponent);
        const spyOnConsoleWarn = spyOn(console, 'warn');
        const destoyMethod: string = 'unexistingDestoyMethod';

        service.configComponentInstance(overlayRef, new DOMRect(100, 100, 1, 1), {}, destoyMethod);

        expect(spyOnConsoleWarn).toHaveBeenCalledWith(ERROR_DESTROY_METHOD_UNEXISTING(destoyMethod));
        overlayRef.instance.customDestroyMethod();
    });
});
