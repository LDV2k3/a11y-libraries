import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IconDummyConfigService } from './icon.module.providers.private';
import { provideA11yIcon } from './icon.module.providers';

import { IconComponent } from './icon.component';
import { IconDynamicComponentDirective } from './icon.directive';

import type { IconConfig } from './icon.type';

@NgModule({
    declarations: [IconComponent, IconDynamicComponentDirective],
    imports: [CommonModule],
    exports: [IconComponent],
})
export class A11yIconModule {
    constructor(private dummyService: IconDummyConfigService) {}

    /**
     * @description
     * This method is meant to be used on the main application to set the icon's defaults.
     *
     * @param { IconConfig } config - The given config.
     */
    static rootConfig(config: IconConfig): ModuleWithProviders<A11yIconModule> {
        return {
            ngModule: A11yIconModule,
            providers: [...provideA11yIcon(config)],
        };
    }
}
