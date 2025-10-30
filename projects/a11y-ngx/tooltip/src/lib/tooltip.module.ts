import { NgModule, ModuleWithProviders, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';

import { A11yOverlayModule } from '@a11y-ngx/overlay';
import { A11yColorSchemeModule } from '@a11y-ngx/color-scheme';

import { TooltipComponent } from './tooltip.component';
import { TooltipDirective } from './tooltip.directive';

import { TOOLTIP_CONFIG_INJECTOR, TooltipCreateService } from './tooltip.create.service';

import { TOOLTIP_SCHEME_CONFIG } from './tooltip.color-scheme';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './tooltip.errors';

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
            providers: [
                { provide: TOOLTIP_CONFIG_INJECTOR, useValue: config },
                {
                    provide: TooltipDummyConfigService,
                    useFactory: initTooltipRootConfigFactory,
                    deps: [TooltipCreateService, TOOLTIP_CONFIG_INJECTOR],
                },
            ],
        };
    }
}

@Injectable({ providedIn: 'root' })
class TooltipDummyConfigService {}

export function initTooltipRootConfigFactory(service: TooltipCreateService, config: TooltipRootConfig): void {
    if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

    service.initRootConfig(config);
}
