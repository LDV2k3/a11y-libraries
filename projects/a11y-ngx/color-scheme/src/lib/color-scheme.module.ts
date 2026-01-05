import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ColorSchemeSelectComponent } from './components/select/color-scheme-select.component';
import { ColorSchemeCheckboxComponent } from './components/checkbox/color-scheme-checkbox.component';

import { ColorScheme, ColorSchemeConfig, ColorSchemeGlobalConfig } from './color-scheme.type';

import {
    ColorSchemeDummyConfigCustomService,
    ColorSchemeDummyConfigRootService,
} from './color-scheme.module.providers.private';
import { provideA11yColorScheme, provideA11yColorSchemeFeature } from './color-scheme.module.providers';

@NgModule({
    declarations: [ColorSchemeSelectComponent, ColorSchemeCheckboxComponent],
    imports: [CommonModule, FormsModule],
    exports: [ColorSchemeSelectComponent, ColorSchemeCheckboxComponent],
})
export class A11yColorSchemeModule {
    constructor(
        private dummyServiceRoot: ColorSchemeDummyConfigRootService,
        private dummyServiceCustom: ColorSchemeDummyConfigCustomService
    ) {}

    /**
     * @description
     * To provide a configuration for the Color Scheme on your app.
     *
     * **IMPORTANT:** Use this only at the root level on your application, **never** on a library or component.
     *
     * @param { ColorScheme | ColorSchemeGlobalConfig } config - The given Color Scheme to use or a more complete configuration object.
     */
    static rootConfig(config: ColorScheme | ColorSchemeGlobalConfig): ModuleWithProviders<A11yColorSchemeModule> {
        return {
            ngModule: A11yColorSchemeModule,
            providers: [...provideA11yColorScheme(config)],
        };
    }

    /**
     * @description
     * To provide one (or more) Color Scheme config for your library or component.
     *
     * @param { ColorSchemeConfig | ColorSchemeConfig[] } config - The given configuration(s).
     */
    static setColorScheme(config: ColorSchemeConfig | ColorSchemeConfig[]): ModuleWithProviders<A11yColorSchemeModule> {
        return {
            ngModule: A11yColorSchemeModule,
            providers: [...provideA11yColorSchemeFeature(config)],
        };
    }
}
