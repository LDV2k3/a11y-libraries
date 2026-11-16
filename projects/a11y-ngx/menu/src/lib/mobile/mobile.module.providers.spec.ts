import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';

import { A11yMobileModule } from './mobile.module';
import { provideA11yMobile } from './mobile.module.providers';

import { MobileRootService } from './mobile.service.root';

import * as ERRORS from './mobile.errors';

describe('provideA11yMobile', () => {
    it('should throw an error when provided more than once', () => {
        TestBed.configureTestingModule({ imports: [A11yMobileModule.rootConfig({ breakpoint: 300 })] });
        const rootInjector = TestBed.inject(Injector);

        expect(() =>
            Injector.create({
                parent: rootInjector,
                providers: [provideA11yMobile({})],
            })
        ).toThrowError(ERRORS.ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());
    });

    it('should save the given value correctly when using the "provideA11yMobile()"', () => {
        TestBed.configureTestingModule({ providers: [provideA11yMobile({ breakpoint: 300 })] });

        const service = TestBed.inject(MobileRootService);
        expect(service.config.breakpoint).toBe(300);
    });

    it(`should save the given value correctly when using the module's "rootConfig()" method`, () => {
        TestBed.configureTestingModule({ imports: [A11yMobileModule.rootConfig({ breakpoint: 800 })] });

        const service = TestBed.inject(MobileRootService);
        expect(service.config.breakpoint).toBe(800);
    });
});
