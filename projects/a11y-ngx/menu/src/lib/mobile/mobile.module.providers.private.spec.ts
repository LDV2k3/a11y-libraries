import { TestBed } from '@angular/core/testing';

import { A11yMobileModule } from './mobile.module';
import { MobileRootService } from './mobile.service.root';

import * as ERRORS from './mobile.errors';
import { initMobileRootConfigFactory } from './mobile.module.providers.private';

import { MOBILE_DEFAULTS } from './mobile.type.private';
import type { MobileConfig } from './mobile.type';

describe('initMobileRootConfigFactory', () => {
    let service!: MobileRootService;

    const config: MobileConfig = { breakpoint: 700 };

    describe('when provided more than once', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [A11yMobileModule.rootConfig(config)] });
            service = TestBed.inject(MobileRootService);
        });

        it('should throw an error', () => {
            expect(() => initMobileRootConfigFactory(service, {})).toThrowError(
                ERRORS.ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE()
            );
        });
    });

    describe('when provided with a config object', () => {
        beforeEach(() => (service = TestBed.inject(MobileRootService)));

        it('should save that config correctly', () => {
            initMobileRootConfigFactory(service, config);
            expect(service.config).toEqual({ ...MOBILE_DEFAULTS, ...config });
        });
    });
});
