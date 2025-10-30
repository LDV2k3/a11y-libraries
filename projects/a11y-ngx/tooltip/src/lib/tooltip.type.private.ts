import { OVERLAY_DEFAULTS as OVERLAY_CONFIG, OverlaySelectorConfig } from '@a11y-ngx/overlay';

import { TooltipConfig } from './tooltip.type';

export const TOOLTIP_SELECTOR: string = 'a11y-tooltip';
export const TOOLTIP_TOUCH_DELAY: number = 300;

export const TOOLTIP_CONFIG: OverlaySelectorConfig & TooltipConfig = {
    ...OVERLAY_CONFIG,

    selector: TOOLTIP_SELECTOR,
    arrowSize: 5,
    borderRadius: 4,
    maxWidth: '200px',
    fadeMs: 125,
    fadeDelayMs: 400,
    padding: '3px 7px',
    shadow: 'none',
    fluidSize: false,
    allowTabCycle: false,
    allowClose: false,

    delayOnEvent: {
        mouse: true,
        keyboard: false,
        touch: false,
    },
    animate: true,
    prevail: true,
    asLabel: false,
    toggleOn: ['ControlLeft', 'ControlRight'],
};

export type TooltipHostData = {
    nodeName: string;
    text: Partial<{
        alt: string;
        ariaLabel: string;
        ariaLabelledBy: string;
        inner: string;
    }>;
    is: Partial<{
        abbr: boolean;
        area: boolean;
        img: boolean;
        imgWithNoAlt: boolean;
    }>;
};

export type TooltipDelayEvents = {
    keyboard: boolean;
    mouse: boolean;
    touch: boolean;
};
