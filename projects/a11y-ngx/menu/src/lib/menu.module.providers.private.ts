import { PLATFORM_ID, InjectionToken, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { libName } from './menu.errors';

export const WINDOW: InjectionToken<Window> = new InjectionToken<Window>(`${libName} Window Token`, {
    providedIn: 'root',
    factory: (): Window =>
        (isPlatformBrowser(inject(PLATFORM_ID)) ? inject(DOCUMENT).defaultView : null) as unknown as Window,
});
