import { InjectionToken } from '@angular/core';

// Token to inject window object when available.
// Primarily not to break SSR (Server Side Rendering) projects.
export const WINDOW: InjectionToken<Window | undefined> = new InjectionToken<Window | undefined>(
    'Window Resize Window Token',
    {
        providedIn: 'root',
        factory: (): Window | undefined => (typeof window !== 'undefined' ? window : undefined),
    }
);
