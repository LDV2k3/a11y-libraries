import { TestBed } from '@angular/core/testing';
import { forceStylesCleanup } from '../test';
import { Component } from '@angular/core';

import { A11yColorSchemeModule } from '@a11y-ngx/color-scheme';

import { A11yOverlayModule } from './overlay.module';
import { OverlayService } from './overlay.service';

import { OVERLAY_DEFAULTS, OverlayRootConfig, OverlayCustomConfig } from './overlay.type';

import {
    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_ALREADY_PROVIDED,
    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_EMPTY,
    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_NOT_ALLOWED,
    ERROR_UPDATE_CONFIG_SELECTOR_UNEXISTING,
    ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE,
} from './overlay.errors';

import { OVERLAY_SELECTOR } from './overlay.type.private';

@Component({
    template: '',
    providers: [OverlayService],
})
class TestComponent {
    constructor(public service: OverlayService) {}
}

describe('Overlay Service provided more than once', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            declarations: [TestComponent],
            providers: [OverlayService],
        })
    );

    afterEach(() => TestBed.resetTestingModule());

    it('should throw error when provided more than once', () => {
        expect(() => TestBed.createComponent(TestComponent)).toThrowError(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE());
    });
});

describe('Overlay Service', () => {
    let service: OverlayService;

    const rootConfig: OverlayRootConfig = { ...OVERLAY_DEFAULTS };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [A11yColorSchemeModule, A11yOverlayModule],
            ...(forceStylesCleanup ? { teardown: { destroyAfterEach: true } } : {}),
        });
        service = TestBed.inject(OverlayService);
    });

    afterEach(() => TestBed.resetTestingModule());

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have the defaults defined', () => {
        expect(service.globalConfig).toEqual(rootConfig);
    });

    describe('should check the "initRootConfig()" method', () => {
        it('should check the root config has been corectly set', () => {
            service.initRootConfig({
                alignmentsAllowed: 'end',
                arrowSize: 20,
                position: 'right-start',
            });

            const config = service.globalConfig;
            expect(config.alignmentsAllowed).toEqual('end');
            expect(config.arrowSize).toEqual(20);
            expect(config.position).toEqual('right-start');
        });

        it('should check the root config has not been set when an undefined object is passed', () => {
            service.initRootConfig(undefined);
            expect(service['configs'][OVERLAY_SELECTOR]).toBe(undefined);
        });
    });

    describe('should check the "initCustomConfigs()" method', () => {
        it('should return when the array of configs is undefined', () => {
            service.initCustomConfigs(undefined);
            expect(Object.keys(service['configs']).length).toEqual(1); // Only the root config
        });

        describe('should check the errors and warnings', () => {
            it('should throw an error when not allowed selector is passed', () => {
                expect(() => service.initCustomConfigs([{ selector: 'root' }])).toThrowError(
                    Error,
                    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_NOT_ALLOWED()
                );
            });

            it('should throw a warning when empty selector is passed', () => {
                const spyOnConsoleWarn = spyOn(console, 'warn');

                service.initCustomConfigs([{ selector: ' ' }]);

                expect(spyOnConsoleWarn).toHaveBeenCalledWith(ERROR_INIT_CUSTOM_CONFIG_SELECTOR_EMPTY());
            });

            it('should throw a warning when an undefined selector is passed', () => {
                const spyOnConsoleWarn = spyOn(console, 'warn');

                service.initCustomConfigs([{ selector: undefined }]);

                expect(spyOnConsoleWarn).toHaveBeenCalledWith(ERROR_INIT_CUSTOM_CONFIG_SELECTOR_EMPTY());
            });

            it('should throw a warning when the selector was already passed', () => {
                const spyOnConsoleWarn = spyOn(console, 'warn');

                const selector: string = 'test-selector';

                service.initCustomConfigs([{ selector }, { selector }]);

                expect(spyOnConsoleWarn).toHaveBeenCalledWith(
                    ERROR_INIT_CUSTOM_CONFIG_SELECTOR_ALREADY_PROVIDED(selector)
                );
            });
        });

        it('should check the custom config has been set correctly', () => {
            const config1: OverlayCustomConfig = {
                selector: 'test-selector-1',
                arrowSize: 10,
            };
            const config2: OverlayCustomConfig = {
                selector: 'test-selector-2',
                arrowSize: 20,
            };
            service.initCustomConfigs([config1, config2]);

            expect(service.getConfig('test-selector-1').arrowSize).toEqual(10);
            expect(service.getConfig('test-selector-2').arrowSize).toEqual(20);
            expect(service.globalConfig.arrowSize).toEqual(OVERLAY_DEFAULTS.arrowSize);
        });
    });

    describe('should check the "getProcessedOffset()" method', () => {
        it('should return the right sum is calculated when custom values are passed using a selector', () => {
            service.initCustomConfigs([
                {
                    selector: 'test-selector',
                    arrowSize: 10,
                    offsetSize: 20,
                },
            ]);

            const processedConfig = service.getProcessedConfig('test-selector');
            const processedOffset = service.getProcessedOffset(processedConfig);

            expect(processedOffset).toEqual(30);
        });

        it('should return the right sum is calculated when custom values are passed using a config object', () => {
            const processedConfig = service.getProcessedConfig({
                arrowSize: 2,
                offsetSize: 3,
            });
            const processedOffset = service.getProcessedOffset(processedConfig);

            expect(processedOffset).toEqual(5);
        });

        it('should return the default sum is calculated when unexisting selector is passed', () => {
            const processedConfig = service.getProcessedConfig('test-selector');
            const processedOffset = service.getProcessedOffset(processedConfig);

            expect(processedOffset).toEqual(OVERLAY_DEFAULTS.arrowSize + OVERLAY_DEFAULTS.offsetSize);
        });
    });

    describe('should check the "getProcessedConfig()" method', () => {
        it('should return two empty objects when an undefined config is passed', () => {
            const { custom, module } = service.getProcessedConfig(undefined);

            expect(custom).toEqual({});
            expect(module).toEqual({});
        });

        it('should return the right objects when custom values are passed using a selector', () => {
            const config: OverlayCustomConfig = {
                selector: 'test-selector',
                arrowSize: 10,
                offsetSize: 20,
            };
            service.initCustomConfigs([config]);

            const { custom, module } = service.getProcessedConfig('test-selector');

            expect(custom).toEqual({ selector: 'test-selector' });
            expect(module).toEqual(config);
        });

        it('should return the right objects when custom values are passed using a config object', () => {
            const config: OverlayCustomConfig = {
                arrowSize: 2,
                offsetSize: 3,
            };
            const { custom, module } = service.getProcessedConfig(config);

            expect(custom).toEqual(config);
            expect(module).toEqual({});
        });

        it('should return the right objects when custom values are passed using a config object with selector inside', () => {
            const config: OverlayCustomConfig = {
                selector: 'test-selector',
                arrowSize: 2,
                offsetSize: 3,
            };
            service.initCustomConfigs([config]);

            const { custom, module } = service.getProcessedConfig(config);

            expect(custom).toEqual(config);
            expect(module).toEqual(config);
        });

        it('should return two empty objects when unexisting selector is passed', () => {
            const { custom, module } = service.getProcessedConfig('test-selector');

            expect(custom).toEqual({ selector: 'test-selector' });
            expect(module).toEqual({});
        });
    });

    describe('should check the "getClassNames()" method', () => {
        it('should return an array with the class names if a string is passed', () => {
            const classNames: string[] | undefined = service.getClassNames('test-class test-custom-class');
            expect(classNames).toEqual(['test-class', 'test-custom-class']);
        });

        it('should return an array with the same class names if an array is passed', () => {
            const classNames: string[] | undefined = service.getClassNames([
                'test-class',
                'test-some-class',
                'test-custom-class',
            ]);
            expect(classNames).toEqual(['test-class', 'test-some-class', 'test-custom-class']);
        });

        it('should return undefined if nothing is passed', () => {
            const classNames: string[] | undefined = service.getClassNames(undefined);
            expect(classNames).toBe(undefined);
        });
    });

    describe('should check the "getConfig()" method', () => {
        it('should return the default root + custom config when the right selector is passed', () => {
            const theConfig: OverlayCustomConfig = {
                selector: 'test-selector',
                arrowSize: 2,
                offsetSize: 3,
            };
            service.initCustomConfigs([theConfig]);

            const config: OverlayRootConfig = service.getConfig('test-selector');
            expect(config).toEqual({ ...rootConfig, ...theConfig });
        });

        it('should return the default root config if unexisting selector is passed', () => {
            const config: OverlayRootConfig = service.getConfig('test-selector');
            expect(config).toEqual(rootConfig);
        });
    });

    describe('should check the "updateConfig()" method', () => {
        const selector: string = 'test-selector';
        const theConfig: OverlayCustomConfig = {
            selector: selector,
            arrowSize: 2,
            offsetSize: 3,
        };

        beforeEach(() => service.initCustomConfigs([theConfig]));

        it('should update the config when the right selector and config are passed', () => {
            service.updateConfig(selector, { arrowSize: 10 });

            const config: OverlayRootConfig = service.getConfig(selector);
            expect(config).toEqual({ ...rootConfig, ...theConfig, arrowSize: 10 });
        });

        it('should not update if empty selector is passed', () => {
            service.updateConfig('', { arrowSize: 10 });

            const config: OverlayRootConfig = service.getConfig(selector);
            expect(config).toEqual({ ...rootConfig, ...theConfig });
        });

        it('should not update if no config is passed', () => {
            service.updateConfig(selector, undefined);

            const config: OverlayRootConfig = service.getConfig(selector);
            expect(config).toEqual({ ...rootConfig, ...theConfig });
        });

        it('should throw a warning if unexisting selector is passed', () => {
            const spyOnConsoleWarn = spyOn(console, 'warn');

            service.updateConfig('test-selector-1', {});

            expect(spyOnConsoleWarn).toHaveBeenCalledWith(ERROR_UPDATE_CONFIG_SELECTOR_UNEXISTING('test-selector-1'));
        });
    });
});
