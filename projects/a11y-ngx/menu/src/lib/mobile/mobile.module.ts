import { NgModule, ModuleWithProviders } from '@angular/core';

import { provideA11yMobile } from './mobile.module.providers';

import type { MobileConfig } from './mobile.type';

@NgModule({})
export class A11yMobileModule {
    /**
     * @description
     * This method is meant to be used on the main application to override the global default configuration.
     *
     * @param { MobileConfig } config - The given configuration.
     */
    static rootConfig(config: MobileConfig): ModuleWithProviders<A11yMobileModule> {
        return {
            ngModule: A11yMobileModule,
            providers: provideA11yMobile(config),
        };
    }
}
