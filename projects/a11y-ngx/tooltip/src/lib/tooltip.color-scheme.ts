import {
    ColorSchemeCSSMap,
    ColorSchemeConfig,
    ColorSchemeProperties,
    ColorSchemesObject,
} from '@a11y-ngx/color-scheme';

import { TOOLTIP_SELECTOR, TOOLTIP_CONFIG } from './tooltip.type.private';

export const TOOLTIP_STYLES_ID: string = 'a11y-tooltip-styles';
export const TOOLTIP_COLOR_SCHEME_PROPERTY: string = 'colorSchemes';

export const TOOLTIP_CSS_PROPERTIES: ColorSchemeCSSMap = {
    backgroundColor: { property: '--tooltip-bg-color', ignoreIfUsingBS: true },
    textColor: { property: '--tooltip-text-color', ignoreIfUsingBS: true },
    borderSize: { property: '--tooltip-border-size', suffix: 'px', ignoreIfUsingBS: true },
    borderColor: { property: '--tooltip-border-color', ignoreIfUsingBS: true },
    borderRadius: { property: '--tooltip-border-radius', suffix: 'px', ignoreIfUsingBS: true },
    shadow: { property: '--tooltip-shadow', ignoreIfUsingBS: true },
    shadowColor: { property: '--tooltip-shadow-color', ignoreIfUsingBS: true },
    fadeMs: { property: '--tooltip-fade-ms', suffix: 'ms' },
    padding: { property: '--tooltip-padding', ignoreIfUsingBS: true },
    arrowSize: { property: '--tooltip-arrow', suffix: 'px' },
    zIndex: { property: '--tooltip-zindex', ignoreIfUsingBS: true },
};

export const TOOLTIP_BASE_SCHEME: ColorSchemeProperties = {
    backgroundColor: 'var(--a11y-bg-color)',
    textColor: 'var(--a11y-text-color)',
    borderColor: 'var(--a11y-border-color)',
    shadowColor: 'var(--a11y-shadow-color)',
};

export const TOOLTIP_COLOR_SCHEME_GENERICS: ColorSchemeProperties = {
    arrowSize: TOOLTIP_CONFIG.arrowSize,
    padding: TOOLTIP_CONFIG.padding,
    borderRadius: TOOLTIP_CONFIG.borderRadius,
    fadeMs: TOOLTIP_CONFIG.fadeMs,
    borderSize: TOOLTIP_CONFIG.borderSize,
    zIndex: TOOLTIP_CONFIG.zIndex,
    shadow: TOOLTIP_CONFIG.shadow,
};

export const TOOLTIP_COLOR_SCHEME: ColorSchemesObject = {
    generics: TOOLTIP_COLOR_SCHEME_GENERICS,
    schemes: {
        light: TOOLTIP_BASE_SCHEME,
        dark: TOOLTIP_BASE_SCHEME,
    },
};

export const TOOLTIP_SCHEME_CONFIG: ColorSchemeConfig = {
    selector: TOOLTIP_SELECTOR,
    cssTagID: TOOLTIP_STYLES_ID,
    stylesMap: TOOLTIP_CSS_PROPERTIES,
    styles: TOOLTIP_COLOR_SCHEME,
};
