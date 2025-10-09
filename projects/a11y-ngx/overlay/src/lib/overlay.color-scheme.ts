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
    backgroundColor: { property: '--overlay-bg-color', ignoreIfUsingBS: true },
    textColor: { property: '--overlay-text-color', ignoreIfUsingBS: true },
    borderSize: { property: '--overlay-border-size', suffix: 'px', ignoreIfUsingBS: true },
    borderColor: { property: '--overlay-border-color', ignoreIfUsingBS: true },
    borderRadius: { property: '--overlay-border-radius', suffix: 'px', ignoreIfUsingBS: true },
    shadow: { property: '--overlay-shadow', ignoreIfUsingBS: true },
    shadowColor: { property: '--overlay-shadow-color', ignoreIfUsingBS: true },
    fadeMs: { property: '--overlay-fade-ms', suffix: 'ms' },
    padding: { property: '--overlay-padding', ignoreIfUsingBS: true },
    arrowSize: { property: '--overlay-arrow', suffix: 'px' },
    zIndex: { property: '--overlay-zindex', ignoreIfUsingBS: true },
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
