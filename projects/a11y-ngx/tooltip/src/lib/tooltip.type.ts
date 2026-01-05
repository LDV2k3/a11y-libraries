import type { OverlayBaseConfig } from '@a11y-ngx/overlay-base';
import type { OverlayConfigStyles } from '@a11y-ngx/overlay';
import type { ColorSchemeStylesConfig } from '@a11y-ngx/color-scheme';

import type { TooltipColorSchemes, TooltipDelayEvents } from './tooltip.type.private';

export type Tooltip = string;

export type TooltipConfig = ColorSchemeStylesConfig &
    Omit<
        OverlayConfigStyles,
        'maxHeight' | 'fadeDelayMs' | 'fadeMs' | 'borderRadius' | 'arrowSize' | 'maxWidth' | 'colorSchemes'
    > &
    Partial<{
        /** @description To define the color schemes for the Tooltip. */
        colorSchemes: TooltipColorSchemes;
    }> &
    Omit<OverlayBaseConfig, 'fluidSize' | 'trigger'> & {
        /** @description The desired max width. @default '200px' */
        maxWidth: string;
        /** @description The size of the arrow (translated to pixels). @default 5 */
        arrowSize: number;
        /** @description The border radius (translated to pixels). @default 4 */
        borderRadius: number;
        /** @description The timeout to fade in or out the tooltip (translated to milliseconds). @default 125 */
        fadeMs: number;
        /** @description The time it will take to start to fade in or out after the tooltip is shown or hidden (translated to milliseconds). @default 400 */
        fadeDelayMs: number;

        /** @description To establish on which events should delay (`fadeDelayMs` property) when show/hide the tooltip. @default { mouse: true, keyboard: false, touch: false } */
        delayOnEvent: Partial<TooltipDelayEvents>;
        /** @description To allow animation when show/hide the tooltip. @default true */
        animate: boolean;
        /** @description To prevail the tooltip when hover over it. @default true */
        prevail: boolean;
        /** @description To set the tooltip text as label of its trigger (using `aria-label`). @default false */
        asLabel: boolean;
        /** @description To allow toggle the tooltip's visibility when pressing one of the given `KeyboardEvent` key codes. @default ['ControlLeft', 'ControlRight'] */
        toggleOn: string[];
    };

export type TooltipRootConfig = Partial<TooltipConfig>;
