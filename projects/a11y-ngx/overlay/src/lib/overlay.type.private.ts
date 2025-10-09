import { ColorSchemesStyles } from '@a11y-ngx/color-scheme';

import { OverlayConfigStyles, OverlayRootConfig, OverlayCustomConfig } from './overlay.type';

export const OVERLAY_SELECTOR: string = 'a11y-overlay';
export const OVERLAY_SELECTOR_BASE: string = 'a11y-overlay-base';
export const OVERLAY_SELECTOR_DIRECTIVE: string = '[a11yOverlay]';
export const OVERLAY_SELECTOR_EXPORT: string = 'a11yOverlay';

export const OVERLAY_CONTAINER_CLASS: string = 'a11y-overlay-container';

export const OVERLAY_CSS_PROPERTIES_DIRECTIVE: OverlayCSSProperties = {
    backgroundColor: {
        inputProperty: 'inputBackgroundColor',
    },
    textColor: {
        inputProperty: 'inputTextColor',
    },
    borderSize: {
        inputProperty: 'inputBorderSize',
        typeNumber: true,
    },
    borderColor: {
        inputProperty: 'inputBorderColor',
    },
    borderRadius: {
        inputProperty: 'inputBorderRadius',
        typeNumber: true,
    },
    shadow: {
        inputProperty: 'inputShadow',
    },
    shadowColor: {
        inputProperty: 'inputShadowColor',
    },
    fadeMs: {
        inputProperty: 'inputFadeMs',
        typeNumber: true,
    },
    padding: {
        inputProperty: 'inputPadding',
    },
    arrowSize: {
        inputProperty: 'inputArrowSize',
        typeNumber: true,
    },
    zIndex: {
        inputProperty: 'inputZIndex',
        typeNumber: true,
    },
};

type OverlayCSSProperties = {
    [property: string]: OverlayCSSProperty;
};

export type OverlayCSSProperty = {
    inputProperty: string;
    typeNumber?: boolean;
};

export type OverlayStylesGenerics = {
    /** @description The size of the arrow (translated to pixels). @default 7 */
    arrowSize: number;
    /** @description The timeout to fade in or out the overlay (translated to milliseconds). @default 150 */
    fadeMs: number;
    /** @description The z-index CSS value. @default 9999 */
    zIndex: number;
    /** @description The padding. @default '10px 16px' */
    padding: string;
    /** @description The size of the border (translated to pixels). @default 1 */
    borderSize: number;
    /** @description The border radius (translated to pixels). @default 5 */
    borderRadius: number;
};

export type OverlayStylesColorScheme = {
    /** @description The background color. @default 'var(--a11y-bg-color)' */
    backgroundColor: string;
    /** @description The text color. @default 'var(--a11y-text-color)' */
    textColor: string;
    /** @description The border color. @default 'var(--a11y-border-color)' */
    borderColor: string;
    /** @description The shadow. @default 'var(--a11y-shadow)' */
    shadow: string;
    /** @description The shadow color. @default 'var(--a11y-shadow-color)' */
    shadowColor: string;
};

export type OverlayStylesColorSchemeObject = {
    colorSchemes: Omit<ColorSchemesStyles, 'generics'>;
};

export type OverlayCustomNoTriggerConfig = Omit<OverlayCustomConfig, 'trigger'>;

export type OverlayDirectiveConfig = OverlayConfigStyles & {
    /** @description If the overlay is visible to the DOM. */
    show: boolean;
    /** @description If the overlay is visually visible. */
    fade: boolean;
    /** @description To allow tab cycle. */
    tabCycle: boolean;
    /** @description To allow close with ESC key. */
    closeEscape: boolean;
    /** @description To allow close with click outside. */
    closeClickOutside: boolean;
};

export type OverlayProcessedConfig = Partial<{
    module: OverlayRootConfig;
    custom: OverlayCustomConfig;
}>;

export type OverlayAllowClose = Partial<{
    /** @description Allows close by using ESC key. */
    escape: boolean;
    /** @description Allows close by clicking outside of the overlay. */
    clickOutside: boolean;
}>;

export type OverlayPositionY = {
    top: number | null;
    bottom: number | null;
};

export type OverlayPositionX = {
    left: number | null;
    right: number | null;
};
