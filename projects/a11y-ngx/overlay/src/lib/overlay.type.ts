import {
    OVERLAY_BASE_DEFAULTS,
    OverlayBaseConfig,
    OverlayBasePosition,
    OverlayBaseAlignment,
    OverlayBasePositionInput,
    OverlayBasePositionStrategy,
} from '@a11y-ngx/overlay-base';
import { ColorSchemeStylesConfig } from '@a11y-ngx/color-scheme';
import { TabCycleFirstFocus } from '@a11y-ngx/tab-cycle';

import { OverlayStylesColorScheme, OverlayStylesGenerics } from './overlay.color-scheme';
import { OverlayAllowClose, OverlayColorSchemes } from './overlay.type.private';

export const OVERLAY_DEFAULTS: OverlayConfig = {
    ...OVERLAY_BASE_DEFAULTS,
    arrowSize: 7,
    fadeMs: 150,
    fadeDelayMs: 0,
    zIndex: 9999,
    padding: '10px 16px',
    shadow: 'var(--a11y-shadow)',
    shadowColor: 'var(--a11y-shadow-color)',
    backgroundColor: 'var(--a11y-bg-color)',
    textColor: 'var(--a11y-text-color)',
    borderSize: 1,
    borderColor: 'var(--a11y-border-color)',
    borderRadius: 5,
    className: undefined,
    maxWidth: 'auto',
    maxHeight: undefined,
    allowClose: true,
    allowTabCycle: true,
    firstFocusOn: undefined,
};

export type OverlayPosition = OverlayBasePosition;

export type OverlayAlignment = OverlayBaseAlignment;

export type OverlayPositionInput = OverlayBasePositionInput;

export type OverlayPositionStrategy = OverlayBasePositionStrategy;

export type OverlayConfig = OverlayBaseConfig & OverlayConfigStyles & OverlayConfigBehavior & ColorSchemeStylesConfig;

export type OverlayConfigStyles = OverlayStylesGenerics &
    OverlayStylesColorScheme &
    Partial<{
        /** @description To define the color schemes. */
        colorSchemes: OverlayColorSchemes;
    }> & {
        /** @description The space between the overlay and its trigger (translated to pixels). @default 5 */
        offsetSize: number;
        /** @description The time it will take to start to fade in or out after the overlay is shown or hidden (translated to milliseconds). @default 0 */
        fadeDelayMs: number;
        /** @description To define custom class name/s. */
        className: string | string[] | undefined;
        /** @description The desired max width. */
        maxWidth: string;
        /** @description The desired max height. */
        maxHeight: string | undefined;
    };

export type OverlayConfigBehavior = {
    /** @description To allow close the overlay. @default true */
    allowClose: OverlayAllowClose | boolean;
    /** @description To allow enclose tabbing within the overlay. @default true */
    allowTabCycle: boolean;
    /** @description To set the first focus on the overlay element (default), or either the first/last tabbable element inside (if `allowTabCycle` is set to `true`). @default undefined */
    firstFocusOn: TabCycleFirstFocus;
};

export type OverlaySelectorConfig = Partial<OverlayConfig> & {
    /** @description The element selector for custom overlay usage. */
    selector: string;
};

export type OverlayRootConfig = Partial<Omit<OverlayConfig, 'trigger'>>;

export type OverlayCustomConfig = Partial<OverlaySelectorConfig> &
    Partial<{
        /** @description The trigger element. */
        trigger: HTMLElement | DOMRect;
        /** @description The boundary HTML Element or its string selector. */
        boundary: string | HTMLElement;
    }>;
