import { NgModule, ModuleWithProviders, inject } from '@angular/core';

import { ThemeRootService } from './theme.service.root';

import { provideA11yTheme } from './theme.module.providers';

@NgModule({})
export class A11yThemeModule {
    private service: ThemeRootService = inject(ThemeRootService);

    /**
     * @description
     * This method is meant to be used on the main application to establish a specific theme.
     *
     * @param { 'light' | 'dark' | 'auto' } theme - The given theme.
     */
    static rootConfig(theme: 'light' | 'dark' | 'auto'): ModuleWithProviders<A11yThemeModule> {
        return {
            ngModule: A11yThemeModule,
            providers: provideA11yTheme(theme),
        };
    }
}
