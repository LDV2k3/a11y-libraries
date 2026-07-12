import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { ThemeRootService } from './theme.service.root';
import { ThemeService } from './theme.service';

import { ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE } from './theme.errors';

describe('ThemeService', () => {
    let service: ThemeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeService);
    });

    describe('when provided more than once', () => {
        @Component({ providers: [ThemeService] })
        class TestMenuDuplicatedServiceComponent {
            constructor(private service: ThemeService) {}
        }

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                declarations: [TestMenuDuplicatedServiceComponent],
                providers: [ThemeService],
            });
        });

        it('should throw an error', () => {
            expect(() => TestBed.createComponent(TestMenuDuplicatedServiceComponent)).toThrowError(
                ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('ThemeService')
            );
        });
    });

    it('should return undefined when no theme was saved (default)', () => {
        expect(service.theme).toBeUndefined();
    });

    it('should return "light" when established', () => {
        const rootService = TestBed.inject(ThemeRootService);
        rootService.initRootConfig('light');

        expect(service.theme).toEqual('light');
    });

    it('should return "dark" when established', () => {
        const rootService = TestBed.inject(ThemeRootService);
        rootService.initRootConfig('dark');

        expect(service.theme).toEqual('dark');
    });
});
