import { Injectable, InjectionToken } from '@angular/core';

import type { ThemeRootService } from './theme.service.root';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './theme.errors';

import type { Theme } from './theme.type';

export const THEME_CONFIG_INJECTOR = new InjectionToken<Theme>('A11y Theme Root Config');

@Injectable({ providedIn: 'root' })
export class ThemeDummyConfigService {}

export function initThemeRootConfigFactory(service: ThemeRootService, theme: Theme): void {
    if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

    service.initRootConfig(theme);
}
