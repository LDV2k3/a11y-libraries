import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { A11yThemeModule } from '@a11y-ngx/theme';
import { A11yIconModule } from '@a11y-ngx/icon';
import { A11yMobileModule } from './mobile/mobile.module';
import { A11yLiveAnnouncerModule } from './announcer/announcer.module';

import { MenuDirective } from './menu.directive';

import { MenuContainerComponent } from './menu.container.component';

import { MenuComponent } from './components/menu.component';
import { MenuGroupStackComponent } from './components/menu-group-stack.component';
import { MenuGroupInlineComponent } from './components/menu-group-inline.component';
import { MenuItemComponent } from './components/menu-item.component';
import { MenuItemInfoComponent } from './components/menu-item-info.component';
import { MenuTooltipComponent } from './components/menu-tooltip.component';
import { MenuItemCheckComponent } from './components/menu-item-check.component';
import { MenuSeparatorComponent } from './components/menu-separator.component';

import { MenuDummyConfigService, MenuDummyConfigCustomService } from './menu.module.providers.private';
import { provideA11yMenu, provideA11yMenuFeature } from './menu.module.providers';

import type { MenuCustomConfig, MenuConfig } from './menu.type';

@NgModule({
    declarations: [
        MenuDirective,
        MenuComponent,
        MenuContainerComponent,
        MenuGroupStackComponent,
        MenuGroupInlineComponent,
        MenuItemComponent,
        MenuItemInfoComponent,
        MenuItemCheckComponent,
        MenuSeparatorComponent,
        MenuTooltipComponent,
    ],
    exports: [MenuDirective],
    imports: [CommonModule, A11yThemeModule, A11yMobileModule, A11yLiveAnnouncerModule, A11yIconModule],
})
export class A11yMenuModule {
    constructor(
        private dummyService: MenuDummyConfigService,
        private dummyServiceCustom: MenuDummyConfigCustomService
    ) {}

    /**
     * @description
     * This method is meant to be used on the main application to override the global default configuration.
     *
     * @param { MenuConfig } config - The given configuration.
     */
    static rootConfig(config: MenuConfig): ModuleWithProviders<A11yMenuModule> {
        return {
            ngModule: A11yMenuModule,
            providers: provideA11yMenu(config),
        };
    }

    /**
     * @description
     * This method is meant to be used on libraries/components where a custom menu configuration is needed,
     * such as menubars or context menus.
     *
     * @param { MenuCustomConfig } config - The given configuration.
     */
    static customConfig(config: MenuCustomConfig): ModuleWithProviders<A11yMenuModule> {
        return {
            ngModule: A11yMenuModule,
            providers: provideA11yMenuFeature(config),
        };
    }
}
