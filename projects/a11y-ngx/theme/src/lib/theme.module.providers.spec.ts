import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';

import { A11yThemeModule } from './theme.module';
import { provideA11yTheme } from './theme.module.providers';

import { ThemeRootService } from './theme.service.root';

import * as ERRORS from './theme.errors';

describe('provideA11yTheme', () => {
    beforeEach(() => localStorage.removeItem('a11yTheme'));

    it('should throw an error when provided more than once', () => {
        TestBed.configureTestingModule({ imports: [A11yThemeModule.rootConfig('dark')] });
        const rootInjector = TestBed.inject(Injector);

        expect(() =>
            Injector.create({
                parent: rootInjector,
                providers: [provideA11yTheme('light')],
            })
        ).toThrowError(ERRORS.ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());
    });

    it('should save the given value correctly when using the "provideA11yTheme()"', () => {
        TestBed.configureTestingModule({ providers: [provideA11yTheme('light')] });

        const service = TestBed.inject(ThemeRootService);
        expect(service.theme).toEqual('light');
    });

    it(`should NOT save the given value when using the "provideA11yTheme()" with "auto"`, () => {
        TestBed.configureTestingModule({ imports: [A11yThemeModule.rootConfig('auto')] });

        const service = TestBed.inject(ThemeRootService);
        expect(service.theme).toBeUndefined();
    });

    it(`should save the given value correctly when using the module's "rootConfig()" method`, () => {
        TestBed.configureTestingModule({ imports: [A11yThemeModule.rootConfig('dark')] });

        const service = TestBed.inject(ThemeRootService);
        expect(service.theme).toEqual('dark');
    });

    it(`should NOT save the given value when using the module's "rootConfig()" method with "auto"`, () => {
        TestBed.configureTestingModule({ imports: [A11yThemeModule.rootConfig('auto')] });

        const service = TestBed.inject(ThemeRootService);
        expect(service.theme).toBeUndefined();
    });
});
