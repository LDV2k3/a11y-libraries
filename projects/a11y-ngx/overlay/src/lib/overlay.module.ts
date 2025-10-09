import { NgModule, ModuleWithProviders, Injectable, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';

import { A11yColorSchemeModule } from '@a11y-ngx/color-scheme';

import { OverlayCreateCSSRootService } from './overlay-create-root-css.service';
import { OverlayService } from './overlay.service';

import { OverlayBaseComponent } from './overlay.component.base';
import { OverlayComponent } from './overlay.component';
import { OverlayDirective } from './overlay.directive';
import { OverlayTemplateTypePipe } from './overlay-template-type.pipe';

import { OverlayArrowComponent } from './overlay-arrow.component';

import { OVERLAY_COLOR_SCHEME_CONFIG } from './overlay.color-scheme';

import { OverlayRootConfig, OverlayCustomConfig } from './overlay.type';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './overlay.errors';

export const OVERLAY_ROOT_CONFIG_INJECTOR = new InjectionToken<OverlayRootConfig>('A11y Overlay Root Config');
export const OVERLAY_CUSTOM_CONFIG_INJECTOR = new InjectionToken<OverlayCustomConfig>('A11y Overlay Custom Configs');

@NgModule({
    declarations: [
        OverlayBaseComponent,
        OverlayComponent,
        OverlayDirective,
        OverlayArrowComponent,
        OverlayTemplateTypePipe,
    ],
    imports: [CommonModule, A11yColorSchemeModule.setColorScheme(OVERLAY_COLOR_SCHEME_CONFIG)],
    exports: [OverlayBaseComponent, OverlayComponent, OverlayDirective, OverlayArrowComponent],
})
export class A11yOverlayModule {
    constructor(
        private dummyServiceRoot: OverlayDummyConfigRootService,
        private dummyServiceCustom: OverlayDummyConfigCustomService,
        private CSSRootService: OverlayCreateCSSRootService
    ) {
        this.CSSRootService.createCSSRoot();
    }

    /**
     * @description
     * This method is meant to be used on the main application to override the global default configuration.
     *
     * @param { OverlayCustomConfig } config - The given configuration.
     */
    static rootConfig(config: OverlayRootConfig): ModuleWithProviders<A11yOverlayModule> {
        return {
            ngModule: A11yOverlayModule,
            providers: [
                { provide: OVERLAY_ROOT_CONFIG_INJECTOR, useValue: config },
                {
                    provide: OverlayDummyConfigRootService,
                    useFactory: initOverlayRootConfigFactory,
                    deps: [OverlayService, OVERLAY_ROOT_CONFIG_INJECTOR],
                },
            ],
        };
    }

    /**
     * @description
     * This method is meant to be used on libraries/components where a custom color scheme is
     * also being configured using `A11yColorSchemeModule.setColorScheme()`. If no color scheme
     * is provided, all related color properties are going to be ignored and only overlay's will be set.
     *
     * @param { OverlayCustomConfig } config - The given configuration.
     */
    static customConfig(config: OverlayCustomConfig): ModuleWithProviders<A11yOverlayModule> {
        return {
            ngModule: A11yOverlayModule,
            providers: [
                { provide: OVERLAY_CUSTOM_CONFIG_INJECTOR, useValue: config, multi: true },
                {
                    provide: OverlayDummyConfigCustomService,
                    useFactory: initOverlayCustomConfigFactory,
                    deps: [OverlayService, OVERLAY_CUSTOM_CONFIG_INJECTOR],
                },
            ],
        };
    }
}

@Injectable({ providedIn: 'root' })
class OverlayDummyConfigRootService {}

@Injectable({ providedIn: 'root' })
class OverlayDummyConfigCustomService {}

export function initOverlayRootConfigFactory(service: OverlayService, config: OverlayRootConfig): void {
    if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

    service.initRootConfig(config);
}

export function initOverlayCustomConfigFactory(service: OverlayService, configs: OverlayCustomConfig[]): void {
    service.initCustomConfigs(configs);
}
