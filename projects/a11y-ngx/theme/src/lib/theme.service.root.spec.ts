import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, Injector } from '@angular/core';

import { provideA11yTheme } from './theme.module.providers';
import { ThemeRootService } from './theme.service.root';
import { A11yThemeModule } from './theme.module';

describe('ThemeRootService', () => {
    beforeEach(() => localStorage.removeItem('a11yTheme'));

    describe('when instantiating the service directly', () => {
        beforeEach(() => TestBed.configureTestingModule({}));

        describe('Server Side Render (SSR)', () => {
            beforeEach(() => {
                TestBed.resetTestingModule();
                TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
            });

            it('should stop (early return) and NOT invoke the "saveTheme()" method', () => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const spyOnAppendStyles = spyOn<any>(ThemeRootService.prototype, 'appendStyles');
                const spyOnSaveTheme = spyOn(ThemeRootService.prototype, 'saveTheme');

                TestBed.inject(ThemeRootService);

                expect(spyOnAppendStyles).toHaveBeenCalled();
                expect(spyOnSaveTheme).not.toHaveBeenCalled();
            });

            it('should stop (early return) if <style> tag was already created', () => {
                const service = TestBed.inject(ThemeRootService);
                service['appendStyles']();

                const styleTags = document.querySelectorAll('#a11y-theme');
                expect(styleTags.length).toBe(1);
            });
        });

        it('should create the <style> tag', () => {
            TestBed.inject(ThemeRootService);
            const styleTag = document.getElementById('a11y-theme');
            expect(styleTag).toBeTruthy();
        });

        it('should remove the <style> tag when destroyed', () => {
            const service = TestBed.inject(ThemeRootService);
            service.ngOnDestroy();
            const styleTag = document.getElementById('a11y-theme');
            expect(styleTag).toBeFalsy();
        });
    });

    it('should create the <style> tag when using the provider with "auto"', () => {
        TestBed.configureTestingModule({ providers: [provideA11yTheme('auto')] });
        TestBed.inject(Injector); // Force injector creation to trigger ENVIRONMENT_INITIALIZER

        const styleTag = document.getElementById('a11y-theme');
        expect(styleTag).toBeTruthy();

        const service = TestBed.inject(ThemeRootService);
        expect(service.theme).toBeUndefined();
    });

    it('should create the <style> tag when using the module', () => {
        TestBed.configureTestingModule({ imports: [A11yThemeModule] });
        TestBed.inject(Injector); // Force injector creation to trigger ENVIRONMENT_INITIALIZER

        const styleTag = document.getElementById('a11y-theme');
        expect(styleTag).toBeTruthy();

        const service = TestBed.inject(ThemeRootService);
        expect(service.theme).toBeUndefined();
    });
});
