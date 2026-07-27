import { TestBed } from '@angular/core/testing';

import { A11yMenuModule } from './menu.module';
import { MenuRootService } from './menu.service.root';

import * as ERRORS from './menu.errors';
import { initMenuRootConfigFactory, initMenuCustomConfigFactory } from './menu.module.providers.private';

import { MENU_CONFIG_DEFAULT } from './menu.type';
import type { MenuConfig, MenuCustomConfig } from './menu.type';

describe('initMenuRootConfigFactory', () => {
    let service!: MenuRootService;

    const config: MenuConfig = { className: 'test', boundary: 'aside', menuLabel: 'testing menu label' };

    describe('when provided more than once', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [A11yMenuModule.rootConfig(config)] });
            service = TestBed.inject(MenuRootService);
        });

        it('should throw an error', () => {
            expect(() => initMenuRootConfigFactory(service, {})).toThrowError(
                ERRORS.ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE()
            );
        });
    });

    describe('when provided with a config object', () => {
        beforeEach(() => (service = TestBed.inject(MenuRootService)));

        it('should save that config correctly', () => {
            initMenuRootConfigFactory(service, config);
            expect(service.globalConfig).toEqual({ ...MENU_CONFIG_DEFAULT, ...config });
        });
    });
});

describe('initMenuCustomConfigFactory', () => {
    let service!: MenuRootService;

    const configA: MenuCustomConfig = {
        selector: 'config-a-selector',
        className: 'config-a',
        closeOnClickOutside: false,
        iconDefaultLoader: 'icon',
        safeSpace: { top: 20 },
    };
    const configB: MenuCustomConfig = {
        selector: 'config-b-selector',
        className: 'config-b',
        closeOnScrollOutside: false,
        maxWidth: '300px',
        position: 'right-end',
    };

    beforeEach(() => (service = TestBed.inject(MenuRootService)));

    it('should save the given configs correctly', () => {
        initMenuCustomConfigFactory(service, [configA, configB]);
        expect(service.getFeatureConfig('config-a-selector')).toEqual(configA);
        expect(service.getFeatureConfig('config-b-selector')).toEqual(configB);
    });
});
