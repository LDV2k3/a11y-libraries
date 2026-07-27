import { TestBed } from '@angular/core/testing';

import { MenuRootService } from './menu.service.root';

import * as ERRORS from './menu.errors';

import type { MenuConfig, MenuCustomConfig } from './menu.type';

describe('MenuRootService', () => {
    let service: MenuRootService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MenuRootService);
    });

    describe('when saving a custom config', () => {
        it('should throw an error for a non-allowed selector', () => {
            expect(() => service.initCustomConfigs([{ selector: 'a11y-menu', className: '' }])).toThrowError(
                ERRORS.ERROR_INIT_CUSTOM_CONFIG_SELECTOR_NOT_ALLOWED()
            );
        });

        it('should abort for undefined configs', () => {
            spyOn(service, 'updateConfig');
            service.initCustomConfigs(undefined as unknown as MenuCustomConfig[]);
            expect(service.updateConfig).not.toHaveBeenCalled();
        });

        it('should throw an error for a selector with no length', () => {
            spyOn(console, 'warn');
            service.initCustomConfigs([{ selector: ' ', className: '' }]);
            expect(console.warn).toHaveBeenCalledWith(ERRORS.ERROR_INIT_CUSTOM_CONFIG_SELECTOR_EMPTY());
        });

        it('should throw an error for an undefined selector', () => {
            spyOn(console, 'warn');
            service.initCustomConfigs([{ selector: undefined as unknown as string, className: '' }]);
            expect(console.warn).toHaveBeenCalledWith(ERRORS.ERROR_INIT_CUSTOM_CONFIG_SELECTOR_EMPTY());
        });

        it('should throw an error for a selector that has already been provided', () => {
            spyOn(console, 'warn');
            service.initCustomConfigs([
                { selector: 'test-menu-selector', className: '' },
                { selector: 'test-menu-selector', className: '' },
            ]);
            expect(console.warn).toHaveBeenCalledWith(
                ERRORS.ERROR_INIT_CUSTOM_CONFIG_SELECTOR_ALREADY_PROVIDED('test-menu-selector')
            );
        });

        it('should throw an error for a selector that does not exist', () => {
            spyOn(console, 'warn');

            service.initCustomConfigs([{ selector: 'test-menu-selector', className: '' }]);
            service.updateConfig('test-menu-selector-unexisting', { className: '' });

            expect(console.warn).toHaveBeenCalledWith(
                ERRORS.ERROR_UPDATE_CONFIG_SELECTOR_UNEXISTING('test-menu-selector-unexisting')
            );
        });
    });

    describe('when updating a custom config', () => {
        beforeEach(() => spyOn(service, 'cleanConfigUndefined'));

        it('should abort for the non-allowed selector "a11y-menu"', () => {
            service.updateConfig('a11y-menu', { className: 'something' });
            expect(service.cleanConfigUndefined).not.toHaveBeenCalled();
        });

        it('should abort for the non-allowed selector "a11y-menu-container"', () => {
            service.updateConfig('a11y-menu-container', { className: 'something' });
            expect(service.cleanConfigUndefined).not.toHaveBeenCalled();
        });

        it('should abort for a non-existing config', () => {
            service.updateConfig('some-selector', undefined as unknown as MenuConfig);
            expect(service.cleanConfigUndefined).not.toHaveBeenCalled();
        });

        it('should abort for a selector with no length', () => {
            service.updateConfig('', {});
            expect(service.cleanConfigUndefined).not.toHaveBeenCalled();
        });
    });

    describe('when getting a custom config', () => {
        const config = { selector: 'selector-a', className: 'selector-a', closeOnTab: false };
        beforeEach(() => service.initCustomConfigs([config]));

        it('should return the saved config for the given selector', () => {
            expect(service.getFeatureConfig('selector-a')).toEqual(config);
        });

        it('should return an empty object for a non-existing selector', () => {
            expect(service.getFeatureConfig('selector-b')).toEqual({});
        });
    });

    describe('"classNameToArray()" method', () => {
        it('should return an empty array for undefined class names', () => {
            expect(service.classNameToArray(undefined)).toEqual([]);
        });

        it('should return an array with the class names from a given string', () => {
            expect(service.classNameToArray('  cn-a     cn-b   ')).toEqual(['cn-a', 'cn-b']);
        });
    });

    it('should recursively remove the undefined values when providing a config to the "cleanConfigUndefined()" method', () => {
        const config: MenuConfig = {
            offsetMenu: undefined,
            animate: 'left-right',
            throttleMs: undefined,
            mobileLabels: { back: undefined },
        };
        service.cleanConfigUndefined(config);
        expect(config).toEqual({ animate: 'left-right', mobileLabels: {} });
    });
});
