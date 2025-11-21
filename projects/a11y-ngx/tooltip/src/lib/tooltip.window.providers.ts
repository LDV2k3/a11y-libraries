import { Provider, InjectionToken } from '@angular/core';

// Token to inject window object when available.
// Primarily not to break SSR (Server Side Rendering) projects.
export const WINDOW: InjectionToken<Window | undefined> = new InjectionToken<Window | undefined>('WindowToken');

export const TooltipWindowProvider: Provider = {
    provide: WINDOW,
    useFactory: (): Window | undefined => (typeof window !== 'undefined' ? window : undefined),
};
