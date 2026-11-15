import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';

import { A11yIconModule } from './icon.module';
import { provideA11yIcon } from './icon.module.providers';

import { IconRootService } from './icon.service.root';

import * as ERRORS from './icon.errors';

describe('rootConfig() & provideA11yIcon()', () => {
    it('should throw an error when provided more than once', () => {
        TestBed.configureTestingModule({ imports: [A11yIconModule.rootConfig({ basePath: '/' })] });
        const rootInjector = TestBed.inject(Injector);

        expect(() =>
            Injector.create({
                parent: rootInjector,
                providers: [provideA11yIcon({})],
            })
        ).toThrowError(ERRORS.ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());
    });

    it('should save the given value correctly when using the "provideA11yIcon()"', () => {
        TestBed.configureTestingModule({ providers: [provideA11yIcon({ strategy: 'image' })] });

        const service = TestBed.inject(IconRootService);
        expect(service.config.strategy).toEqual('image');
    });

    it(`should save the given value correctly when using the module's "rootConfig()" method`, () => {
        TestBed.configureTestingModule({ imports: [A11yIconModule.rootConfig({ basePath: '/assets/' })] });

        const service = TestBed.inject(IconRootService);
        expect(service.config.basePath).toEqual('/assets/');
    });
});
