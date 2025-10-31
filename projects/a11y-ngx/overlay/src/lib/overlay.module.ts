import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { A11yColorSchemeModule } from '@a11y-ngx/color-scheme';

import { OverlayCreateCSSRootService } from './overlay-create-root-css.service';

import { OverlayBaseComponent } from './overlay.component.base';
import { OverlayComponent } from './overlay.component';
import { OverlayDirective } from './overlay.directive';
import { OverlayTemplateTypePipe } from './overlay-template-type.pipe';

import { OverlayArrowComponent } from './overlay-arrow.component';

import { OVERLAY_COLOR_SCHEME_CONFIG } from './overlay.color-scheme';

import {
    OverlayDummyConfigCustomService,
    OverlayDummyConfigRootService,
    provideA11yOverlay,
    provideA11yOverlayFeature,
} from './overlay.providers';

import { OverlayRootConfig, OverlayCustomConfig } from './overlay.type';

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
     * @param { OverlayRootConfig } config - The given configuration.
     */
    static rootConfig(config: OverlayRootConfig): ModuleWithProviders<A11yOverlayModule> {
        return {
            ngModule: A11yOverlayModule,
            providers: [...provideA11yOverlay(config)],
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
            providers: [...provideA11yOverlayFeature(config)],
        };
    }
}
