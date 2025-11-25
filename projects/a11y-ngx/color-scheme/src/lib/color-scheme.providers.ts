import { InjectionToken } from '@angular/core';

// Token to inject window object when available.
// Primarily not to break SSR (Server Side Rendering) projects.
export const WINDOW: InjectionToken<Window | undefined> = new InjectionToken<Window | undefined>(
    'Color Scheme Window Token',
    {
        providedIn: 'root',
        factory: (): Window | undefined => (typeof window !== 'undefined' ? window : undefined),
    }
);

export const LOCAL_STORAGE: InjectionToken<Storage | undefined> = new InjectionToken<Storage | undefined>(
    'Color Scheme Local Storage Token',
    {
        providedIn: 'root',
        factory: (): Storage | undefined => (typeof localStorage !== 'undefined' ? localStorage : undefined),
    }
);
