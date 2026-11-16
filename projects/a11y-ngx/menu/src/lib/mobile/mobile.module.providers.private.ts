import { PLATFORM_ID, InjectionToken, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { libName } from './mobile.errors';

// Token to inject window object when available.
// Primarily not to break SSR (Server Side Rendering) projects.
export const WINDOW: InjectionToken<Window> = new InjectionToken<Window>(`${libName} Window Token`, {
    providedIn: 'root',
    factory: (): Window =>
        (isPlatformBrowser(inject(PLATFORM_ID)) ? inject(DOCUMENT).defaultView : null) as unknown as Window,
});
