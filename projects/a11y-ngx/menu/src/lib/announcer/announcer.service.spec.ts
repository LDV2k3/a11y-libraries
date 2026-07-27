import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { PLATFORM_ID, Component, ApplicationRef, ComponentRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { LiveAnnouncerService } from './announcer.service';
import { LiveAnnouncerComponent } from './announcer.component';

import { ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE } from './announcer.errors';

describe('LiveAnnouncerService', () => {
    let service: LiveAnnouncerService;
    let appRef: ApplicationRef;

    let announcer: HTMLElement;
    let document: Document;

    const tickAt = (ms: number): void => {
        tick(ms);
        appRef.tick();
    };

    // Custom wrapper to auto-flush timers
    const autoFlush = (testFn: () => void | Promise<void>) => {
        return fakeAsync(() => {
            testFn();
            flush();
        });
    };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LiveAnnouncerService);
        appRef = TestBed.inject(ApplicationRef);
        document = TestBed.inject(DOCUMENT);
        announcer = document.body.querySelector('a11y-live-announcer') as HTMLElement;
    });

    /**
     * Timers:
     * 1. we send empty string
     * 2. we send the actual message after 75 ms
     * 3. we set aria-live with 'polite'/'assertive'
     * 4. we set aria-hidden with 'false'
     * 5. we populate with the message after 100 ms
     * 6. we reset after 3000 ms
     * 6.1. aria-live with 'polite'
     * 6.2. aria-hidden with 'true'
     */

    describe('when provided more than once', () => {
        @Component({ providers: [LiveAnnouncerService] })
        class TestAnnouncerDuplicatedServiceComponent {
            constructor(private service: LiveAnnouncerService) {}
        }

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                declarations: [TestAnnouncerDuplicatedServiceComponent],
                providers: [LiveAnnouncerService],
            });
        });

        it('should throw an error', () => {
            expect(() => TestBed.createComponent(TestAnnouncerDuplicatedServiceComponent)).toThrowError(
                ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('LiveAnnouncerService')
            );
        });
    });

    it('should have the "a11y-visually-hidden" class name and "aria-atomic" attribute set by default', () => {
        expect(announcer.classList.contains('a11y-visually-hidden')).toBeTrue();
        expect(announcer.getAttribute('aria-atomic')).toEqual('true');
    });

    describe('Polite announcements', () => {
        it(
            'should have the attributes correctly set and reset them once announced',
            autoFlush(() => {
                service.announce('test');
                tickAt(75);
                expect(announcer.getAttribute('aria-live')).toEqual('polite');
                expect(announcer.getAttribute('aria-hidden')).toEqual('false');

                tickAt(100 + 3000);
                expect(announcer.getAttribute('aria-live')).toEqual('polite');
                expect(announcer.getAttribute('aria-hidden')).toEqual('true');
            })
        );

        it(
            'should "announce" the given text',
            autoFlush(() => {
                service.announce('test announce 1');
                tickAt(75 + 100);
                expect(announcer.textContent?.trim()).toEqual('test announce 1');
            })
        );
    });

    describe('Assertive announcements', () => {
        it(
            'should have the attributes correctly set and reset them once announced',
            autoFlush(() => {
                service.interrupt('test');
                tickAt(75);
                expect(announcer.getAttribute('aria-live')).toEqual('assertive');
                expect(announcer.getAttribute('aria-hidden')).toEqual('false');

                tickAt(100 + 3000);
                expect(announcer.getAttribute('aria-live')).toEqual('polite');
                expect(announcer.getAttribute('aria-hidden')).toEqual('true');
            })
        );

        it(
            'should "interrupt" with the given text',
            autoFlush(() => {
                service.interrupt('test announce 2');
                tickAt(75 + 100);
                expect(announcer.textContent?.trim()).toEqual('test announce 2');
            })
        );
    });
});

describe('LiveAnnouncerService - Server (SSR)', () => {
    let service: LiveAnnouncerService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
        service = TestBed.inject(LiveAnnouncerService);
    });

    it('should stop (early return) and NOT create the live announcer when service gets initiated', () => {
        expect(document.querySelector('a11y-live-announcer')).toBeNull();
    });

    it('should stop (early return) and NOT destroy the announcer reference when service gets destroyed', () => {
        const destroySpy = jasmine.createSpy('destroy');
        service['announcerRef'] = { destroy: destroySpy } as unknown as ComponentRef<LiveAnnouncerComponent>;

        service.ngOnDestroy();
        expect(destroySpy).not.toHaveBeenCalled();
    });
});
