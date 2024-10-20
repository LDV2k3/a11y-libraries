import { NgModule, ModuleWithProviders, Injectable, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ColorSchemeSelectComponent } from './components/select/color-scheme-select.component';
import { ColorSchemeCheckboxComponent } from './components/checkbox/color-scheme-checkbox.component';

import { ColorSchemeServiceRoot } from './color-scheme.service.root';

import { ColorScheme, ColorSchemeConfig, ColorSchemeGlobalConfig } from './color-scheme.type';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './color-scheme.errors';

const COLOR_SCHEME_ROOT_CONFIG_INJECTOR = new InjectionToken<ColorScheme | ColorSchemeGlobalConfig>(
    'A11y Color Scheme Root Config'
);
const COLOR_SCHEME_CUSTOM_CONFIG_INJECTOR = new InjectionToken<ColorSchemeConfig | ColorSchemeConfig[]>(
    'A11y Color Scheme Custom Configs'
);

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

    static rootConfig(config: ColorScheme | ColorSchemeGlobalConfig): ModuleWithProviders<A11yColorSchemeModule> {
        return {
            ngModule: A11yColorSchemeModule,
            providers: [
                { provide: COLOR_SCHEME_ROOT_CONFIG_INJECTOR, useValue: config },
                {
                    provide: ColorSchemeDummyConfigRootService,
                    useFactory: initColorSchemeRootConfigFactory,
                    deps: [ColorSchemeServiceRoot, COLOR_SCHEME_ROOT_CONFIG_INJECTOR],
                },
            ],
        };
    }

    static setColorScheme(config: ColorSchemeConfig | ColorSchemeConfig[]): ModuleWithProviders<A11yColorSchemeModule> {
        return {
            ngModule: A11yColorSchemeModule,
            providers: [
                { provide: COLOR_SCHEME_CUSTOM_CONFIG_INJECTOR, useValue: config, multi: true },
                {
                    provide: ColorSchemeDummyConfigCustomService,
                    useFactory: initColorSchemeCustomConfigFactory,
                    deps: [ColorSchemeServiceRoot, COLOR_SCHEME_CUSTOM_CONFIG_INJECTOR],
                },
            ],
        };
    }
}

@Injectable({ providedIn: 'root' })
class ColorSchemeDummyConfigRootService {}

@Injectable({ providedIn: 'root' })
class ColorSchemeDummyConfigCustomService {}

export function initColorSchemeRootConfigFactory(
    service: ColorSchemeServiceRoot,
    config: ColorScheme | ColorSchemeGlobalConfig
): void {
    if (service.isRootConfigAlreadyProvided) {
        throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());
    }

    service.initRootConfig(config);
}

export function initColorSchemeCustomConfigFactory(
    service: ColorSchemeServiceRoot,
    configs: ColorSchemeConfig[] | ColorSchemeConfig[][]
): void {
    const flatConfig: ColorSchemeConfig[] = configs
        .map((config: ColorSchemeConfig | ColorSchemeConfig[]) => (!Array.isArray(config) ? [config] : config))
        .reduce((previous, current) => previous.concat(current), []);

    service.initCustomConfigs(flatConfig);
}
