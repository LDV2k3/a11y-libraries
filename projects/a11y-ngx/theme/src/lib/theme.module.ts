import { NgModule, ModuleWithProviders } from '@angular/core';

import { ThemeRootService } from './theme.service.root';

import { provideA11yTheme } from './theme.module.providers';
import { ThemeDummyConfigService } from './theme.module.providers.private';

import type { Theme } from './theme.type';

@NgModule({})
export class A11yThemeModule {
    constructor(private service: ThemeRootService, private dummyService: ThemeDummyConfigService) {}

    /**
     * @description
     * This method is meant to be used on the main application to establish a specific theme.
     *
     * @param { Theme } theme - The given theme.
     */
    static rootConfig(theme: Theme): ModuleWithProviders<A11yThemeModule> {
        return {
            ngModule: A11yThemeModule,
            providers: [...provideA11yTheme(theme)],
        };
    }
}
