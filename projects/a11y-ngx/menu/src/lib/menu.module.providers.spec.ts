import { TestBed } from '@angular/core/testing';
import { Component, createEnvironmentInjector, EnvironmentInjector, Injector } from '@angular/core';

import { A11yMenuModule } from './menu.module';
import { provideA11yMenu, provideA11yMenuFeature, injectA11yMenuFeature } from './menu.module.providers';

import { MenuRootService } from './menu.service.root';

import * as ERRORS from './menu.errors';

describe('provideA11yMenu()', () => {
    it('should throw an error when provided more than once', () => {
        TestBed.configureTestingModule({ imports: [A11yMenuModule.rootConfig({ animate: 'scale-up' })] });
        const rootInjector = TestBed.inject(Injector);

        expect(() =>
            Injector.create({
                parent: rootInjector,
                providers: [provideA11yMenu({})],
            })
        ).toThrowError(ERRORS.ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());
    });

    it('should save the given value correctly when using the "provideA11yMenu()"', () => {
        TestBed.configureTestingModule({ providers: [provideA11yMenu({ animateMs: 800 })] });

        const service = TestBed.inject(MenuRootService);
        expect(service.globalConfig.animateMs).toBe(800);
    });

    it(`should save the given value correctly when using the module's "rootConfig()" method`, () => {
        TestBed.configureTestingModule({ imports: [A11yMenuModule.rootConfig({ animateMs: 100 })] });

        const service = TestBed.inject(MenuRootService);
        expect(service.globalConfig.animateMs).toBe(100);
    });
});

describe('provideA11yMenuFeature()', () => {
    it('should save the given value correctly when using the "provideA11yMenuFeature()"', () => {
        TestBed.configureTestingModule({
            providers: [
                provideA11yMenuFeature({
                    selector: 'feature-provider-selector',
                    className: '.feature-provider-selector',
                    animateMs: 800,
                }),
            ],
        });

        const service = TestBed.inject(MenuRootService);
        expect(service.getFeatureConfig('feature-provider-selector').animateMs).toBe(800);
    });

    it(`should save the given value correctly when using the module's "customConfig()" method`, () => {
        TestBed.configureTestingModule({
            imports: [
                A11yMenuModule.customConfig({
                    selector: 'feature-provider-selector',
                    className: '.feature-provider-selector',
                    animateMs: 100,
                }),
            ],
        });

        const service = TestBed.inject(MenuRootService);
        expect(service.getFeatureConfig('feature-provider-selector').animateMs).toBe(100);
    });

    it('should stop (early return) and NOT save the given value when sending a selector that is already saved', () => {
        const spyInit = spyOn(MenuRootService.prototype, 'initCustomConfig').and.callThrough();

        TestBed.configureTestingModule({
            imports: [
                A11yMenuModule.customConfig({
                    selector: 'feature-provider-selector',
                    className: '.feature-provider-selector',
                    animate: 'scale-up',
                }),
            ],
        });

        const service = TestBed.inject(MenuRootService);
        const parentInjector = TestBed.inject(EnvironmentInjector);

        createEnvironmentInjector(
            [
                provideA11yMenuFeature({
                    selector: 'feature-provider-selector',
                    className: '.feature-provider-selector',
                    animate: 'bottom-top',
                }),
            ],
            parentInjector
        );

        expect(spyInit).toHaveBeenCalledTimes(2);
        expect(service.getFeatureConfig('feature-provider-selector').animate).toBe('scale-up');
    });
});

describe('injectA11yMenuFeature()', () => {
    @Component({ template: '' })
    class TestMenuInjectFeatureConfigComponent {
        constructor() {
            injectA11yMenuFeature({
                selector: 'feature-injector-selector',
                className: '.feature-injector-selector',
                offsetMenu: 10,
            });
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestMenuInjectFeatureConfigComponent],
            imports: [A11yMenuModule],
        });
        TestBed.createComponent(TestMenuInjectFeatureConfigComponent);
    });

    it(`should save the given value correctly when using the "injectA11yMenuFeature()"`, () => {
        const service = TestBed.inject(MenuRootService);
        expect(service.globalConfig.offsetMenu).toBe(2);
        expect(service.getFeatureConfig('feature-injector-selector').offsetMenu).toBe(10);
    });
});
