import { Provider } from '@angular/core';

import { TOOLTIP_CONFIG_INJECTOR, TooltipCreateService } from './tooltip.create.service';

import { TooltipDummyConfigService, initTooltipRootConfigFactory } from './tooltip.providers.private';

import { TooltipRootConfig } from './tooltip.type';

/** Provide Tooltip globally (usable in standalone apps) */
export function provideA11yTooltip(config: TooltipRootConfig): Provider[] {
    return [
        { provide: TOOLTIP_CONFIG_INJECTOR, useValue: config },
        {
            provide: TooltipDummyConfigService,
            useFactory: initTooltipRootConfigFactory,
            deps: [TooltipCreateService, TOOLTIP_CONFIG_INJECTOR],
        },
    ];
}
