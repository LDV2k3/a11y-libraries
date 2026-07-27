import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PLATFORM_ID, Component } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { A11yMobileModule } from './mobile.module';
import { provideA11yMobile } from './mobile.module.providers';

import * as ERRORS from './mobile.errors';

import { MobileService } from './mobile.service';
import { MobileDummyConfigService } from './mobile.module.providers.private';

type TestMediaQueryList = {
    matches: boolean;
    addEventListener: jasmine.Spy<jasmine.Func>;
    removeEventListener: jasmine.Spy<jasmine.Func>;
};

describe('MobileService', () => {
    let service: MobileService;
    let mockMediaQueryList: TestMediaQueryList;

    let document: Document;

    const isMobileDevice = (isMobile: boolean): void => {
        // Extract the callback function registered by your service
        const listenerCallback = mockMediaQueryList.addEventListener.calls.mostRecent().args[1];

        // Simulate the browser firing a "matches" event with the desired value from "isMobile"
        listenerCallback({ matches: isMobile } as MediaQueryListEvent);
    };

    beforeEach(() => {
        // 1. Create a fake object that mimics MediaQueryList behavior
        mockMediaQueryList = {
            matches: true, // Default to mobile
            addEventListener: jasmine.createSpy('addEventListener'),
            removeEventListener: jasmine.createSpy('removeEventListener'),
        };

        // 2. Intercept the native window API before the service initializes
        spyOn(window, 'matchMedia').and.returnValue(mockMediaQueryList as unknown as MediaQueryList);

        TestBed.configureTestingModule({});
        service = TestBed.inject(MobileService);
        document = TestBed.inject(DOCUMENT);
    });

    describe('when provided more than once', () => {
        @Component({ providers: [MobileService] })
        class TestMobileDuplicatedServiceRootComponent {
            constructor(private service: MobileService) {}
        }

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                declarations: [TestMobileDuplicatedServiceRootComponent],
                providers: [MobileService],
            });
        });

        it('should throw an error', () => {
            expect(() => TestBed.createComponent(TestMobileDuplicatedServiceRootComponent)).toThrowError(
                ERRORS.ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('MobileService')
            );
        });
    });

    describe('Push/Pop States', () => {
        beforeEach(() => isMobileDevice(true));

        it('should throw a console warn if "popMobileState()" method is invoked without having pushded any previos state', () => {
            spyOn(console, 'warn');
            service.popMobileState();
            expect(console.warn).toHaveBeenCalledWith(ERRORS.ERROR_NO_MORE_STATES_TO_POP());
        });

        it('should NOT throw a console warn if "popMobileState()" method is invoked when pushded states exist', () => {
            spyOn(console, 'warn');
            service.pushMobileState();
            service.popMobileState();
            expect(console.warn).not.toHaveBeenCalledWith(ERRORS.ERROR_NO_MORE_STATES_TO_POP());
        });
    });

    describe('Initialization & Breakpoint Config', () => {
        it('should initialize with the default breakpoint of 768px', () => {
            expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
        });

        it('should initialize with the default breakpoint of 768px even if an undefined value was established', () => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [A11yMobileModule.rootConfig({ breakpoint: undefined })] });
            service = TestBed.inject(MobileService);

            expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
        });

        it(`should initialize with a custom breakpoint provided via module's rootConfig() method`, () => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ imports: [A11yMobileModule.rootConfig({ breakpoint: 900 })] });
            service = TestBed.inject(MobileService);

            expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 900px)');
        });

        it('should initialize with a custom breakpoint provided via provideA11yMobile() provider', () => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({ providers: [provideA11yMobile({ breakpoint: 1000 })] });
            // Needed so the provider can work properly,
            // in a real world scenario the main lib has to import the A11yMobileModule
            TestBed.inject(MobileDummyConfigService);
            service = TestBed.inject(MobileService);

            expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1000px)');
        });
    });

    describe('State Management', () => {
        it('should update "isMobile" to "true" when viewport shrinks below breakpoint', () => {
            isMobileDevice(false);
            isMobileDevice(true);
            expect(service.isMobile).toBeTrue();
        });

        it('should update "isMobile" to "false" when viewport grows above breakpoint', () => {
            isMobileDevice(false);
            expect(service.isMobile).toBeFalse();
        });
    });

    describe('"initMobileState()" method', () => {
        it('should NOT init if empty selector', () => {
            spyOn(window, 'addEventListener');

            service.initMobileState('  ');
            expect(window.addEventListener).not.toHaveBeenCalledWith('popstate', service.popMobileState);
        });

        it('should NOT assign the block class name to the body if is NOT mobile device', () => {
            isMobileDevice(false);
            service.initMobileState('test');
            expect(document.body.classList.contains('a11y-body-blocked-test')).toBeFalse();
        });

        it('should assign the block class name to the body if is mobile device', () => {
            service.initMobileState('test');
            expect(document.body.classList.contains('a11y-body-blocked-test')).toBeTrue();
        });

        it('should add the "inert" attribute to all <script> elements if no "skipFromBlockingSelector" is defined (default)', () => {
            service.initMobileState('test');

            Array.from(document.body.querySelectorAll('script') ?? []).forEach((scriptEl) =>
                expect(scriptEl.getAttribute('inert')).toEqual('')
            );
        });

        it('should NOT add the "inert" attribute to all <script> elements if specified in "skipFromBlockingSelector"', () => {
            service.initMobileState('test', 'script');

            Array.from(document.body.querySelectorAll('script') ?? []).forEach((scriptEl) =>
                expect(scriptEl.getAttribute('inert')).toBeNull()
            );
        });

        it('should save the "scrollRestoration" on init and restore it on destroy when supported', fakeAsync(() => {
            // Force the getter to return false
            Object.defineProperty(service, 'supportsScrollRestoration', { get: () => true });

            service.initMobileState('test');
            tick(16);
            expect(window.history.scrollRestoration).toEqual('manual');

            service.destroyMobileState('test');
            tick(16);
            expect(window.history.scrollRestoration).toEqual('auto');
        }));

        it('should NOT save the "scrollRestoration" when NOT supported', fakeAsync(() => {
            // Force the getter to return false
            Object.defineProperty(service, 'supportsScrollRestoration', { get: () => false });

            service.initMobileState('test');
            tick(16);
            expect(window.history.scrollRestoration).toEqual('auto');
        }));
    });

    describe('"destroyMobileState()" method', () => {
        it('should stop (early return) if <body> was not blocked before because it is NOT a mobile device', () => {
            isMobileDevice(false);
            service.initMobileState('test');

            spyOn(window, 'removeEventListener');

            service.destroyMobileState('test');
            expect(window.removeEventListener).not.toHaveBeenCalledWith('popstate', service.popMobileState);
        });

        it('should remove the window listener for the "popstate" if was previously added', () => {
            service.initMobileState('test');

            spyOn(window, 'removeEventListener');

            service.destroyMobileState('test');
            expect(window.removeEventListener).toHaveBeenCalledWith('popstate', service.popMobileState);
        });

        it('should NOT remove the window listener for the "popstate" if there are still active body locks', () => {
            service.initMobileState('test-1');
            service.initMobileState('test-2');

            spyOn(window, 'removeEventListener');

            service.destroyMobileState('test-1');
            expect(window.removeEventListener).not.toHaveBeenCalledWith('popstate', service.popMobileState);
        });

        it('should remove the "inert" attribute from all the root elements', () => {
            const allInertElements = document.body.querySelectorAll(':scope > *');

            service.initMobileState('test');
            Array.from(allInertElements).forEach((rootElem) => expect(rootElem.getAttribute('inert')).toEqual(''));

            service.destroyMobileState('test');
            Array.from(allInertElements).forEach((rootElem) => expect(rootElem.getAttribute('inert')).toBeNull());
        });

        describe('Unblock the Body', () => {
            it('should stop (early return) and NOT scroll the page when there are still active body locks', fakeAsync(() => {
                service.initMobileState('test-1');
                service.initMobileState('test-2');
                spyOn(document.documentElement, 'scrollTo');

                service['unblockBody']('test-2');
                tick(16);
                expect(document.documentElement.scrollTo).toHaveBeenCalledTimes(0);
            }));

            it('should scroll the page when there are NOT active body locks', fakeAsync(() => {
                service.initMobileState('test');
                spyOn(document.documentElement, 'scrollTo');

                service['unblockBody']('test');
                tick(16);
                expect(document.documentElement.scrollTo).toHaveBeenCalledTimes(1);
            }));
        });
    });

    describe('"pushMobileState()" method', () => {
        it('should stop (early return) if is not mobile device', () => {
            isMobileDevice(false);
            spyOn(window.history, 'pushState');

            service.pushMobileState();
            expect(window.history.pushState).not.toHaveBeenCalled();
        });

        it('should push several new states', () => {
            service.pushMobileState();
            service.pushMobileState();
            service.pushMobileState();
            service.pushMobileState();
            expect(window.history.state).toEqual({ a11yMobileStatesCount: 4 });

            // clean up
            service.popMobileState();
            service.popMobileState();
            service.popMobileState();
            service.popMobileState();
        });
    });

    describe('"popMobileState()" method', () => {
        it('should stop (early return) if is not mobile device', () => {
            isMobileDevice(false);

            service.popMobileState();
            expect(service['currentMobileStatesCount']).toBe(0);
        });

        it('should emit through "mobileHistoryBack$"', () => {
            service.pushMobileState();
            expect(service['currentMobileStatesCount']).toBe(1);

            spyOn(service.mobileHistoryBack$, 'next');

            service.popMobileState();
            expect(service.mobileHistoryBack$.next).toHaveBeenCalled();
        });
    });

    it('should have defined the CSS variables when the <body> element gets blocked and being removed when unblocked', () => {
        service.initMobileState('test');
        expect(document.body.style.getPropertyValue('--a11y-body-blocked-y')).not.toBeNull();
        expect(document.body.style.getPropertyValue('--a11y-body-blocked-x')).not.toBeNull();

        service.destroyMobileState('test');
        expect(document.body.style.getPropertyValue('--a11y-body-blocked-y')).toEqual('');
        expect(document.body.style.getPropertyValue('--a11y-body-blocked-x')).toEqual('');
    });

    it('should NOT have defined any block class names in the <body> when destroyed', fakeAsync(() => {
        service.initMobileState('test-1');
        service.initMobileState('test-2');
        service.initMobileState('test-3');

        expect(document.body.classList.contains('a11y-body-blocked-test-1')).toBeTrue();
        expect(document.body.classList.contains('a11y-body-blocked-test-2')).toBeTrue();
        expect(document.body.classList.contains('a11y-body-blocked-test-3')).toBeTrue();

        service.ngOnDestroy();
        tick(16);
        expect(document.body.classList.contains('a11y-body-blocked-test-1')).toBeFalse();
        expect(document.body.classList.contains('a11y-body-blocked-test-2')).toBeFalse();
        expect(document.body.classList.contains('a11y-body-blocked-test-3')).toBeFalse();
    }));
});

describe('MobileService - Server (SSR)', () => {
    let service: MobileService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
        service = TestBed.inject(MobileService);

        Object.defineProperty(service, 'isMobile', { get: () => true });
    });

    it('should stop (early return) when service is initiated', () => {
        spyOn(window, 'matchMedia');
        expect(window.matchMedia).not.toHaveBeenCalled();
    });

    it('should stop (early return) when invoking "initMobileState()" method', () => {
        spyOn(window, 'addEventListener');
        service.initMobileState('test');
        expect(window.addEventListener).not.toHaveBeenCalledWith('popstate', service.popMobileState);
    });

    it('should stop (early return) when invoking "destroyMobileState()" method', () => {
        Object.defineProperty(service, 'bodyIsBlocked', { value: true });
        spyOn(service as unknown as { unblockBody: () => void }, 'unblockBody');
        service.destroyMobileState('test');
        expect(service['unblockBody']).not.toHaveBeenCalledWith('test');
    });

    it('should stop (early return) when invoking "blockBody()" method', () => {
        service['blockBody']('test');
        expect(service['activeBodyLocks'].size).toBe(0);
    });

    it('should stop (early return) when invoking "unblockBody()" method', () => {
        document.body.style.setProperty('--a11y-body-blocked-y', '-25px');
        service['unblockBody']('test');
        expect(document.body.style.getPropertyValue('--a11y-body-blocked-y')).toEqual('-25px');
    });

    it('should stop (early return) when invoking "restoreScrollRestoration()" method', () => {
        const originalValue = window.history.scrollRestoration;

        window.history.scrollRestoration = 'manual';
        service['restoreScrollRestoration']();
        expect(window.history.scrollRestoration).toEqual('manual');

        window.history.scrollRestoration = originalValue;
    });

    it('should stop (early return) when invoking "cleanUpMobileStates()" method', () => {
        service['currentMobileStatesCount'] = 4;
        service['cleanUpMobileStates']();
        expect(service['currentMobileStatesCount']).toBe(4);
    });

    it('should return false when checking "supportsScrollRestoration" getter', () => {
        expect(service['supportsScrollRestoration']).toBeFalse();
    });
});
