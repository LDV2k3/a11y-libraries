import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { A11yOverlayModule } from '@a11y-ngx/overlay';
import { A11yColorSchemeModule } from '@a11y-ngx/color-scheme';

import { TooltipComponent } from './tooltip.component';
import { TooltipDirective } from './tooltip.directive';

import { TOOLTIP_SCHEME_CONFIG } from './tooltip.color-scheme';

import { TooltipDummyConfigService } from './tooltip.providers.private';
import { provideA11yTooltip } from './tooltip.providers';

import { TooltipRootConfig } from './tooltip.type';
import { TOOLTIP_CONFIG } from './tooltip.type.private';

@NgModule({
    declarations: [TooltipComponent, TooltipDirective],
    exports: [TooltipDirective],
    imports: [
        CommonModule,
        A11yColorSchemeModule.setColorScheme(TOOLTIP_SCHEME_CONFIG),
        A11yOverlayModule.customConfig(TOOLTIP_CONFIG),
    ],
})
export class A11yTooltipModule {
    constructor(private dummyService: TooltipDummyConfigService) {}

    static rootConfig(config: TooltipRootConfig): ModuleWithProviders<A11yTooltipModule> {
        return {
            ngModule: A11yTooltipModule,
            providers: [...provideA11yTooltip(config)],
        };
    }
}
