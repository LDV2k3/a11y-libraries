import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';

import { ThemeRootService } from './theme.service.root';
import { ThemeService } from './theme.service';

import { ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE } from './theme.errors';

describe('ThemeService', () => {
    let service: ThemeService;

    beforeEach(() => {
        localStorage.removeItem('a11yTheme');
        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeService);
    });

    describe('when provided more than once', () => {
        @Component({ template: '', providers: [ThemeService] })
        class TestThemeDuplicatedServiceComponent {
            constructor(private service: ThemeService) {}
        }

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                declarations: [TestThemeDuplicatedServiceComponent],
                providers: [ThemeService],
            });
        });

        it('should throw an error', () => {
            expect(() => TestBed.createComponent(TestThemeDuplicatedServiceComponent)).toThrowError(
                ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE('ThemeService')
            );
        });
    });

    it('should return undefined when no theme was saved (default)', () => {
        expect(service.theme).toBeUndefined();
        expect(localStorage.getItem('a11yTheme')).toBeNull();
    });

    it('should return "light" when established', () => {
        const rootService = TestBed.inject(ThemeRootService);
        spyOn(rootService, 'saveTheme').and.callThrough();

        rootService.initRootConfig('light');

        expect(service.theme).toEqual('light');
        expect(localStorage.getItem('a11yTheme')).toEqual('light');
        expect(rootService.saveTheme).toHaveBeenCalledWith('light');
    });

    it('should return "dark" when established', () => {
        const rootService = TestBed.inject(ThemeRootService);
        spyOn(rootService, 'saveTheme').and.callThrough();

        rootService.initRootConfig('dark');

        expect(service.theme).toEqual('dark');
        expect(localStorage.getItem('a11yTheme')).toEqual('dark');
        expect(rootService.saveTheme).toHaveBeenCalledWith('dark');
    });

    it('should return "undefined" when NOT value established', () => {
        const rootService = TestBed.inject(ThemeRootService);
        spyOn(rootService, 'saveTheme').and.callThrough();

        rootService.initRootConfig(null);

        expect(service.theme).toBeUndefined();
        expect(localStorage.getItem('a11yTheme')).toBeNull();
        expect(rootService.saveTheme).toHaveBeenCalledWith(null);
    });

    describe('when updating with "theme" setter', () => {
        beforeEach(() => TestBed.inject(ThemeRootService).initRootConfig('dark'));

        it('should return "light" and save in localStorage', () => {
            service.theme = 'light';
            expect(service.theme).toEqual('light');
            expect(localStorage.getItem('a11yTheme')).toEqual('light');
        });

        it(`should return "undefined" and delete it from localStorage when "'auto'" is provided`, () => {
            service.theme = 'auto';
            expect(service.theme).toBeUndefined();
            expect(localStorage.getItem('a11yTheme')).toBeNull();
        });

        it('should return "undefined" and delete it from localStorage when "undefined" is provided', () => {
            service.theme = undefined;
            expect(service.theme).toBeUndefined();
            expect(localStorage.getItem('a11yTheme')).toBeNull();
        });
    });
});
