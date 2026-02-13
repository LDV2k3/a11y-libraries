import { ColorSchemes, ColorSchemesObject, ColorSchemeCSSMap, ColorSchemeConfig } from '@a11y-ngx/color-scheme';

import { OVERLAY_SELECTOR } from './overlay.type.private';
import { OVERLAY_DEFAULTS } from './overlay.type';

export const OVERLAY_STYLES_ID: string = 'a11y-overlay-styles';
export const OVERLAY_COLOR_SCHEME_PROPERTY: string = 'colorSchemes';

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

export const OVERLAY_CSS_PROPERTIES: ColorSchemeCSSMap<OverlayStylesGenerics & OverlayStylesColorScheme> = {
    backgroundColor: { property: '--overlay-bg-color' },
    textColor: { property: '--overlay-text-color' },
    borderSize: { property: '--overlay-border-size', suffix: 'px' },
    borderColor: { property: '--overlay-border-color' },
    borderRadius: { property: '--overlay-border-radius', suffix: 'px' },
    shadow: { property: '--overlay-shadow' },
    shadowColor: { property: '--overlay-shadow-color' },
    fadeMs: { property: '--overlay-fade-ms', suffix: 'ms' },
    padding: { property: '--overlay-padding' },
    arrowSize: { property: '--overlay-arrow', suffix: 'px' },
    zIndex: { property: '--overlay-zindex' },
};

export const OVERLAY_BASE_SCHEME: OverlayStylesColorScheme = {
    backgroundColor: 'var(--a11y-bg-color)',
    textColor: 'var(--a11y-text-color)',
    borderColor: 'var(--a11y-border-color)',
    shadow: 'var(--a11y-shadow)',
    shadowColor: 'var(--a11y-shadow-color)',
};

export const OVERLAY_COLOR_SCHEME_GENERICS: OverlayStylesGenerics = {
    arrowSize: OVERLAY_DEFAULTS.arrowSize,
    fadeMs: OVERLAY_DEFAULTS.fadeMs,
    zIndex: OVERLAY_DEFAULTS.zIndex,
    padding: OVERLAY_DEFAULTS.padding,
    borderSize: OVERLAY_DEFAULTS.borderSize,
    borderRadius: OVERLAY_DEFAULTS.borderRadius,
};

export const OVERLAY_COLOR_SCHEMES: ColorSchemes<OverlayStylesColorScheme> = {
    light: { ...OVERLAY_BASE_SCHEME },
    dark: { ...OVERLAY_BASE_SCHEME },
};

export const OVERLAY_COLOR_SCHEME: ColorSchemesObject = {
    generics: OVERLAY_COLOR_SCHEME_GENERICS,
    schemes: OVERLAY_COLOR_SCHEMES,
};

export const OVERLAY_COLOR_SCHEME_CONFIG: ColorSchemeConfig = {
    selector: OVERLAY_SELECTOR,
    cssTagID: OVERLAY_STYLES_ID,
    stylesMap: OVERLAY_CSS_PROPERTIES,
    styles: OVERLAY_COLOR_SCHEME,
};
