import { TestBed } from '@angular/core/testing';

import { A11yThemeModule } from './theme.module';
import { ThemeRootService } from './theme.service.root';

import * as ERRORS from './theme.errors';
import { initThemeRootConfigFactory } from './theme.module.providers.private';

describe('initThemeRootConfigFactory', () => {
    let service!: ThemeRootService;

    describe('when provided more than once', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [A11yThemeModule.rootConfig('dark')] });
            service = TestBed.inject(ThemeRootService);
        });

        it('should throw an error', () => {
            expect(() => initThemeRootConfigFactory(service, 'light')).toThrowError(
                ERRORS.ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE()
            );
        });
    });

    describe('when provided with a specific value', () => {
        beforeEach(() => (service = TestBed.inject(ThemeRootService)));

        it('should save that value correctly set', () => {
            initThemeRootConfigFactory(service, 'light');
            expect(service.theme).toEqual('light');
        });
    });
});
