import {
    ColorSchemesObject,
    ColorSchemeCSSMap,
    ColorSchemeConfig,
    ColorSchemeProperties,
} from '@a11y-ngx/color-scheme';

import { OVERLAY_SELECTOR } from './overlay.type.private';
import { OVERLAY_DEFAULTS } from './overlay.type';

export const OVERLAY_STYLES_ID: string = 'a11y-overlay-styles';
export const OVERLAY_COLOR_SCHEME_PROPERTY: string = 'colorSchemes';

export const OVERLAY_CSS_PROPERTIES: ColorSchemeCSSMap = {
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

export const OVERLAY_BASE_SCHEME: ColorSchemeProperties = {
    backgroundColor: 'var(--a11y-bg-color)',
    textColor: 'var(--a11y-text-color)',
    borderColor: 'var(--a11y-border-color)',
    shadow: 'var(--a11y-shadow)',
    shadowColor: 'var(--a11y-shadow-color)',
};

export const OVERLAY_COLOR_SCHEME_GENERICS: ColorSchemeProperties = {
    arrowSize: OVERLAY_DEFAULTS.arrowSize,
    fadeMs: OVERLAY_DEFAULTS.fadeMs,
    zIndex: OVERLAY_DEFAULTS.zIndex,
    padding: OVERLAY_DEFAULTS.padding,
    borderSize: OVERLAY_DEFAULTS.borderSize,
    borderRadius: OVERLAY_DEFAULTS.borderRadius,
};

export const OVERLAY_COLOR_SCHEME: ColorSchemesObject = {
    generics: OVERLAY_COLOR_SCHEME_GENERICS,
    schemes: {
        light: { ...OVERLAY_BASE_SCHEME },
        dark: { ...OVERLAY_BASE_SCHEME },
    },
};

export const OVERLAY_COLOR_SCHEME_CONFIG: ColorSchemeConfig = {
    selector: OVERLAY_SELECTOR,
    cssTagID: OVERLAY_STYLES_ID,
    stylesMap: OVERLAY_CSS_PROPERTIES,
    styles: OVERLAY_COLOR_SCHEME,
};
